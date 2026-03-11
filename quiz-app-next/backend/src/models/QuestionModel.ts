import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    roomId: { type: String, required: true }, // Ties the problem to the room
    title: { type: String, required: true },
    description: { type: String },
    options: [{ id: Number, title: String }],
    answer: { type: Number, required: true }
});

export const QuestionModel = mongoose.model('Question', questionSchema);