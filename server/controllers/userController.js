import User from '../models/User.js';
import { fetchLeetCodeStats } from '../services/leetcodeService.js';
import { generateAiSuggestions } from '../services/aiService.js';

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const refreshMyStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const newStats = await fetchLeetCodeStats(user.leetcodeUsername);
        user.statsHistory.push({ ...newStats, date: new Date() });
        await user.save();

        res.status(200).json({ message: 'Stats refreshed successfully.', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to refresh stats.', error: error.message });
    }
};

export const getAiSuggestion = async (req, res) => {
    console.log("✅ Checkpoint 1: AI suggestion request received in controller.");
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.statsHistory.length === 0) {
            return res.status(400).json({ message: 'No stats available to generate suggestions.' });
        }
        
        const latestStats = user.statsHistory[user.statsHistory.length - 1];
        
        const aiResult = await generateAiSuggestions(latestStats);
        
        console.log("✅ Checkpoint 3: AI suggestion successfully generated and received from service.");

        // --- THIS IS THE CRUCIAL FIX ---

        // 1. Combine the detailed feedback into a single string for the database.
        const combinedFeedback = `Strengths: ${aiResult.strengths}\nWeaknesses: ${aiResult.weaknesses}\nActionable Advice: ${aiResult.actionableAdvice}`;
        user.aiFeedback.push({ feedback: combinedFeedback });
        
        // 2. Flatten the nested questions array to match the database schema.
        const flattenedQuestions = aiResult.recommendedQuestions.flatMap(topicGroup => 
            topicGroup.questions.map(q => ({
                title: q.title,
                difficulty: q.difficulty,
                reason: q.reason,
                url: q.url || `https://leetcode.com/problems/${q.title.toLowerCase().replace(/\s/g, '-')}/`
            }))
        );
        user.suggestedQuestions = flattenedQuestions; 
        
        // --- END OF FIX ---
        
        await user.save();

        res.status(200).json(aiResult);
    } catch (error) {
        console.error("❌ ERROR in controller:", error);
        res.status(500).json({ message: 'Failed to generate AI suggestion.', error: error.message });
    }
};