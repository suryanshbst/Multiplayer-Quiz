import express from 'express';
import { QuizModel } from '../models/QuizModel';
import { UserModel } from '../models/User';

const router = express.Router();

// Get all past quizzes
router.get('/history', async (req, res) => {
    try {
        const quizzes = await QuizModel.find({ isEnded: true }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Get global user leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await UserModel.find().sort({ totalPoints: -1 }).limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

export default router;