
import dotenv from 'dotenv';
dotenv.config();
import Groq from 'groq-sdk';
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to robustly extract a JSON object from a string
const extractJson = (str) => {
    const jsonMatch = str.match(/{[\s\S]*}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }
    return null;
};

export const generateAiSuggestions = async (userStats) => {
    const { totalSolved, topicStats } = userStats;

    const strengths = [...topicStats].sort((a, b) => b.problemsSolved - a.problemsSolved).slice(0, 2).map(t => t.tagName).join(', ');
    const weaknesses = [...topicStats].sort((a, b) => a.problemsSolved - b.problemsSolved).slice(0, 2).map(t => t.tagName).join(', ');

    const systemPrompt = `You are an expert LeetCode coach. Your task is to provide a detailed, personalized analysis of a user's performance and recommend practice questions.
You MUST respond in a valid JSON object format ONLY. Do not include any text, markdown, or explanations outside of the JSON structure.

The JSON object must have these exact keys: "strengths", "weaknesses", "actionableAdvice", and "recommendedQuestions".

1.  "strengths": A short string (1-2 sentences) positively highlighting the user's strongest topics based on their solve counts.
2.  "weaknesses": A short string (1-2 sentences) identifying the user's weakest topics. Be encouraging.
3.  "actionableAdvice": A single, clear, actionable next step for the user (2-3 sentences).
4.  "recommendedQuestions": An array of objects. Each object must represent a topic and have two keys:
    - "topic": The name of the DSA topic (e.g., "Arrays", "Dynamic Programming").
    - "questions": An array of 1-2 question objects for that topic. Each question object must have "title", "difficulty", and "reason" keys.

Group the recommended questions by their weakest topics.`;

    const userPrompt = `Analyze my LeetCode stats and provide a response in JSON format.
- Total Problems Solved: ${totalSolved}
- My Strongest Topics: ${strengths}
- My Weakest Topics: ${weaknesses}`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            response_format: { "type": "json_object" },
        });

        const rawResponse = chatCompletion.choices[0]?.message?.content;
        const jsonString = extractJson(rawResponse);

        if (!jsonString) {
            throw new Error("AI did not return a valid JSON object from its response.");
        }

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("❌ ERROR from Groq service:", error);
        throw new Error('Failed to communicate with the Groq AI model.');
    }
};