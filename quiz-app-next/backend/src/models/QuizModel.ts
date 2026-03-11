import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    hasStarted: { type: Boolean, default: false },
    isEnded: { type: Boolean, default: false },
    leaderboard: [{
        name: String,
        points: Number
    }]
}, { timestamps: true });

export const QuizModel = mongoose.model('QuizData', quizSchema);