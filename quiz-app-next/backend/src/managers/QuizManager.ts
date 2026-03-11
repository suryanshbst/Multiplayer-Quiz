import { AllowedSubmissions, Quiz } from "../Quiz";
import { QuizModel } from "../models/QuizModel";

let globalProblemId = 0;

export class QuizManager {
    private quizes: Quiz[];
    constructor() {
        this.quizes = [];
    }

    public start(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return;
        quiz.start();
    }

    public addProblem(roomId: string, problem: {
        title: string;
        description: string;
        image?: string;
        options: { id: number; title: string; }[];
        answer: AllowedSubmissions;
    }) {
        const quiz = this.getQuiz(roomId);
        if(!quiz) return;
        
        quiz.addProblem({
            ...problem,
            id: (globalProblemId++).toString(),
            startTime: new Date().getTime(),
            submissions: []
        });
    }
    
    public next(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if(!quiz) return;
        quiz.next();
    }

    addUser(roomId: string, name: string) {
        return this.getQuiz(roomId)?.addUser(name);
    }

    submit(userId: string, roomId: string, problemId: string, submission: 0 | 1 | 2 | 3) {
        this.getQuiz(roomId)?.submit(userId, roomId, problemId, submission);   
    }
    
    getQuiz(roomId: string) {
        return this.quizes.find(x => x.roomId === roomId) ?? null;
    }
    
    getCurrentState(roomId: string) {
        const quiz = this.getQuiz(roomId);
        if (!quiz) return null;
        return quiz.getCurrentState();
    }

    public async addQuiz(roomId: string) {
        if (this.getQuiz(roomId)) return;
        
        // 1. Save room to MongoDB
        try {
            await QuizModel.create({ roomId });
        } catch (e) {
            console.error("Failed to save room to DB", e);
        }

        // 2. Keep live version in memory
        const quiz = new Quiz(roomId);
        this.quizes.push(quiz);
    }   
}