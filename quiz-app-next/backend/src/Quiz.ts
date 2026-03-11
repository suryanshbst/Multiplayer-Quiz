import { IoManager } from "./managers/IoManager";
import { QuizModel } from "./models/QuizModel";
import { QuestionModel } from "./models/QuestionModel";
import { UserModel } from "./models/User";

export type AllowedSubmissions = 0 | 1 | 2 | 3;
const PROBLEM_TIME_S = 20;

interface User { name: string; id: string; points: number; }
interface Submission { problemId: string; userId: string; isCorrect: boolean; optionSelected: AllowedSubmissions }
interface Problem { id: string; title: string; description: string; image?: string; startTime: number; answer: AllowedSubmissions; options: { id: number; title: string; }[]; submissions: Submission[] }

export class Quiz {
    public roomId: string;
    private hasStarted: boolean;
    private problems: Problem[];
    private activeProblem: number;
    private users: User[];
    private currentState: "leaderboard" | "question" | "not_started" | "ended";
    
    constructor(roomId: string) {
        this.roomId = roomId;
        this.hasStarted = false;
        this.problems = [];
        this.activeProblem = 0;
        this.users = [];
        this.currentState = "not_started";
    }

    async addProblem(problem: Problem) {
        this.problems.push(problem);
        // Save the problem to DB asynchronously
        try {
            await QuestionModel.create({
                roomId: this.roomId,
                title: problem.title,
                description: problem.description,
                options: problem.options,
                answer: problem.answer
            });
        } catch (e) {
            console.error("Failed to save problem to DB", e);
        }
    }

    async start() {
        // Prevent starting if there are no problems
        if (this.problems.length === 0) return;

        this.hasStarted = true;
        this.setActiveProblem(this.problems[0]);
        
        try {
            await QuizModel.updateOne({ roomId: this.roomId }, { hasStarted: true });
        } catch (e) {
            console.error("Failed to update start state", e);
        }
    }
    
    setActiveProblem(problem: Problem) {
        this.currentState = "question"
        problem.startTime = new Date().getTime();
        problem.submissions = [];
        IoManager.getIo().to(this.roomId).emit("problem", { problem });
        
        setTimeout(() => {
            this.sendLeaderboard();
        }, PROBLEM_TIME_S * 1000);
    }

    sendLeaderboard() {
        this.currentState = "leaderboard"
        const leaderboard = this.getLeaderboard();
        IoManager.getIo().to(this.roomId).emit("leaderboard", { leaderboard });
    }

    async next() {
        // THE FIX: If the quiz hasn't started yet, clicking 'Next' should start it
        if (!this.hasStarted) {
            await this.start();
            return;
        }

        // Otherwise, move to the next problem
        this.activeProblem++;
        const problem = this.problems[this.activeProblem];
        if (problem) {
            this.setActiveProblem(problem);
        } else {
            this.activeProblem--;
            this.currentState = "ended";
            
            // 1. Emit end to frontend
            IoManager.getIo().to(this.roomId).emit("QUIZ_END", {
                leaderboard: this.getLeaderboard()
            });

            // 2. Save final stats to Database
            await this.endQuizAndSaveToDB();
        }
    }

    private async endQuizAndSaveToDB() {
        const finalLeaderboard = this.getLeaderboard();
        
        try {
            // THE FIX: Using findOneAndUpdate with upsert: true makes this bulletproof!
            await QuizModel.findOneAndUpdate(
                { roomId: this.roomId }, 
                { 
                    $set: { 
                        isEnded: true, 
                        hasStarted: true,
                        leaderboard: finalLeaderboard 
                    } 
                },
                { upsert: true, new: true } 
            );

            // Update all-time global user points
            for (const user of finalLeaderboard) {
                await UserModel.findOneAndUpdate(
                    { name: user.name },
                    { 
                        $inc: { totalPoints: user.points, quizzesPlayed: 1 } 
                    },
                    { upsert: true, new: true } 
                );
            }
            console.log(`✅ SUCCESS: Quiz ${this.roomId} finished and saved to DB!`);
        } catch (e) {
            console.error("❌ Error saving final quiz state to DB:", e);
        }
    }

    genRandonString(length: number) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
        var result = '';
        for ( var i = 0; i < length; i++ ) {
           result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
     }

    addUser(name: string) {
        const id = this.genRandonString(7);
        this.users.push({ id, name, points: 0 });
        return id;
    }

    submit(userId: string, roomId: string, problemId: string, submission: AllowedSubmissions) {
        const problem = this.problems.find(x => x.id == problemId);
        const user = this.users.find(x => x.id === userId);
 
        if (!problem || !user) return;
        const existingSubmission = problem.submissions.find(x => x.userId === userId);
        if (existingSubmission) return;
 
        problem.submissions.push({
            problemId, userId,
            isCorrect: problem.answer === submission,
            optionSelected: submission
        });

        // Award points if correct
        if (problem.answer === submission) {
            user.points += (1000 - (500 * (new Date().getTime() - problem.startTime) / (PROBLEM_TIME_S * 1000)));
        }
    }

    getLeaderboard() {
        // Creates a copy to sort without mutating the original array
        return [...this.users].sort((a, b) => b.points - a.points).slice(0, 20);
    }

    getCurrentState() {
        if (this.currentState === "not_started") return { type: "not_started" };
        if (this.currentState === "ended") return { type: "ended", leaderboard: this.getLeaderboard() };
        if (this.currentState === "leaderboard") return { type: "leaderboard", leaderboard: this.getLeaderboard() };
        if (this.currentState === "question") {
            const problem = this.problems[this.activeProblem];
            return { type: "question", problem };
        }
    }
}