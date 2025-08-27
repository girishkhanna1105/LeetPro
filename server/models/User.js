import mongoose from 'mongoose';

const DailyStatsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    topicStats: [{
        tagName: String,
        problemsSolved: Number
    }],
});

const AISuggestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    difficulty: { type: String, required: true },
    reason: { type: String, required: true },
});

const AIFeedbackSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    feedback: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    leetcodeUsername: { type: String, required: true, unique: true, trim: true },
    statsHistory: { type: [DailyStatsSchema], default: [] },
    suggestedQuestions: { type: [AISuggestionSchema], default: [] },
    aiFeedback: { type: [AIFeedbackSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);