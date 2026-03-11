import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    quizzesPlayed: { type: Number, default: 0 }
});

export const UserModel = mongoose.model('User', userSchema);