import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { CreateProblem } from "./CreateProblem";
import { QuizControls } from "./QuizControls";

export const Admin = () => {
    const [socket, setSocket] = useState<null | any>(null);
    const [quizId, setQuizId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [password, setPassword] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // THE FIX: Pointing to YOUR local backend
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server with ID:", newSocket.id);
        });

        return () => {
            newSocket.disconnect(); // Cleanup on unmount
        };
    }, []);

    const handleCreateRoom = () => {
        if (!socket) return;
        
        // Send the password the user typed
        socket.emit("joinAdmin", {
            password: password
        });

        socket.emit("createQuiz", {
            roomId
        });
        
        setQuizId(roomId);
        setIsConnected(true);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Panel</h1>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter ADMIN_PASSWORD"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
                            <input 
                                type="text" 
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)} 
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. ROOM123"
                            />
                        </div>

                        <button 
                            onClick={handleCreateRoom}
                            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            Create Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Room Active: {quizId}
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <CreateProblem roomId={quizId} socket={socket} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <QuizControls socket={socket} roomId={roomId} />
                    </div>
                </div>
            </div>
        </div>
    );
};