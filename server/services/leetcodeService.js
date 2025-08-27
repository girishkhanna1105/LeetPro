import axios from 'axios';
import User from '../models/User.js';

const LEETCODE_API_URL = 'https://leetcode.com/graphql';

const GET_USER_PROFILE_STATS = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}`;

const GET_TAG_STATS = `
query skillStats($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced { tagName, problemsSolved }
      intermediate { tagName, problemsSolved }
      fundamental { tagName, problemsSolved }
    }
  }
}`;

export const fetchLeetCodeStats = async (leetcodeUsername) => {
    try {
        const [profileRes, tagRes] = await Promise.all([
            axios.post(
                LEETCODE_API_URL,
                {
                    query: GET_USER_PROFILE_STATS,
                    variables: { username: leetcodeUsername },
                },
                { headers: { 'User-Agent': 'Mozilla/5.0' } } // <-- Fix Added Here
            ),
            axios.post(
                LEETCODE_API_URL,
                {
                    query: GET_TAG_STATS,
                    variables: { username: leetcodeUsername },
                },
                { headers: { 'User-Agent': 'Mozilla/5.0' } } // <-- And Here
            ),
        ]);

        if (profileRes.data.errors || !profileRes.data.data.matchedUser) {
             throw new Error('Invalid LeetCode username or failed to fetch profile stats.');
        }

        const stats = profileRes.data.data.matchedUser.submitStats.acSubmissionNum;
        const tagCounts = tagRes.data.data.matchedUser.tagProblemCounts;

        const allTags = [
            ...(tagCounts.advanced || []),
            ...(tagCounts.intermediate || []),
            ...(tagCounts.fundamental || [])
        ];
        
        const topicStats = allTags
            .filter(tag => tag.problemsSolved > 0)
            .map(tag => ({
                tagName: tag.tagName,
                problemsSolved: tag.problemsSolved,
            }));
        
        return {
            easySolved: stats.find(s => s.difficulty === 'Easy')?.count || 0,
            mediumSolved: stats.find(s => s.difficulty === 'Medium')?.count || 0,
            hardSolved: stats.find(s => s.difficulty === 'Hard')?.count || 0,
            totalSolved: stats.find(s => s.difficulty === 'All')?.count || 0,
            topicStats,
        };
    } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error(`Failed to fetch stats for ${leetcodeUsername}:`, errorMessage);
        throw new Error('Could not fetch LeetCode stats. The username might be incorrect or the API is temporarily unavailable.');
    }
};

export const updateAllUsersStats = async () => {
    const users = await User.find({}, 'leetcodeUsername');
    for (const user of users) {
        try {
            const stats = await fetchLeetCodeStats(user.leetcodeUsername);
            await User.findOneAndUpdate(
                { _id: user._id },
                { $push: { statsHistory: { ...stats, date: new Date() } } }
            );
            console.log(`Successfully updated stats for ${user.leetcodeUsername}`);
        } catch (error) {
            console.error(`Cron job failed for user ${user.leetcodeUsername}:`, error.message);
        }
    }
};