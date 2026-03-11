import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { LeaderBoard } from "./leaderboard/LeaderBoard";
import { Quiz } from "./Quiz";

export const User = () => {
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [code, setCode] = useState("");
    
    if (!submitted) {
        return (
            <div className="bg-gray-100 flex items-center justify-center h-screen">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg border border-gray-200">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-slate-800">
                            Join the Arena
                        </h1>
                        <p className="text-gray-500 font-medium">Enter your details below to compete</p>
                    </div>
                    <div className="mb-8 space-y-4">
                        <input
                            className="text-center w-full p-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:border-purple-600 transition-colors"
                            placeholder="Room Code (e.g., ABCD)"
                            style={{ fontSize: "1rem" }}
                            type="text"
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <input
                            className="text-center w-full p-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:border-purple-600 transition-colors"
                            placeholder="Your Display Name"
                            style={{ fontSize: "1rem" }}
                            type="text"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-purple-600 text-white w-full py-3 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-opacity-50 font-bold text-lg transition-transform active:scale-95"
                        onClick={() => {
                            if(code && name) setSubmitted(true);
                            else alert("Please enter both a Room Code and a Name!");
                        }}
                    >
                        Join Game
                    </button>
                </div>
            </div>
        );
    }

    return <UserLoggedin code={code} name={name} />
}

export const UserLoggedin = ({name, code}: {name: string, code: string}) => {
    const [socket, setSocket] = useState<null | any>(null);
    const roomId = code;
    const [currentState, setCurrentState] = useState("not_started");
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        // THE FIX: Pointing to YOUR local backend!
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("Connected to local server!", newSocket.id);
            newSocket.emit("join", {
                roomId,
                name
            })
        });
        
        newSocket.on("init", ({userId, state}) => {
            setUserId(userId);
            if (state.leaderboard) setLeaderboard(state.leaderboard);
            if (state.problem) setCurrentQuestion(state.problem);
            setCurrentState(state.type);
        });

        newSocket.on("leaderboard", (data) => {
            setCurrentState("leaderboard");
            setLeaderboard(data.leaderboard);
        });

        newSocket.on("problem", (data) => {
            setCurrentState("question");
            setCurrentQuestion(data.problem);
        });

        newSocket.on("QUIZ_END", (data) => {
            setCurrentState("ended");
            setLeaderboard(data.leaderboard);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [roomId, name]);

    if (currentState === "not_started") {
        return (
            <div className="bg-gray-100 flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800">Waiting for Host...</h2>
                <p className="text-gray-500 mt-2">The quiz will start shortly. Get ready!</p>
            </div>
        );
    }

    if (currentState === "question" && currentQuestion) {
        return <Quiz roomId={roomId} userId={userId} problemId={currentQuestion.id} quizData={{
            title: currentQuestion.title || currentQuestion.description, // Fallback just in case
            options: currentQuestion.options
        }} socket={socket} />
    }

    if (currentState === "leaderboard") {
        return <LeaderBoard leaderboardData={leaderboard.map((x: any) => ({
            points: Math.round(x.points),
            username: x.name || x.username,
            image: x.image
        }))} />
    }

    if (currentState === "ended") {
        return (
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-green-600 mb-4">🏁 Quiz Completed!</h1>
                    <p className="text-gray-600 text-lg">Check out the final results below.</p>
                </div>
                <LeaderBoard leaderboardData={leaderboard.map((x: any) => ({
                    points: Math.round(x.points),
                    username: x.name || x.username,
                    image: x.image
                }))} />
            </div>
        );
    }

    return null;
}