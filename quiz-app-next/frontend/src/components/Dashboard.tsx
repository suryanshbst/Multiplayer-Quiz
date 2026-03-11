import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Dashboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch MongoDB Data from your new Express Routes
        const fetchData = async () => {
            try {
                const leaderRes = await axios.get('http://localhost:3000/api/quizzes/leaderboard');
                const historyRes = await axios.get('http://localhost:3000/api/quizzes/history');
                setLeaderboard(leaderRes.data);
                setHistory(historyRes.data);
            } catch (error) {
                console.error("Error fetching database data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header section */}
                <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-gray-800">1v1 DSA Quiz Arena</h1>
                    <div className="space-x-4">
                        <button onClick={() => navigate('/user')} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Join Room</button>
                        <button onClick={() => navigate('/admin')} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Create Room</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Hall of Fame (All-Time Leaderboard) */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 Global Hall of Fame</h2>
                        <ul className="space-y-3">
                            {leaderboard.map((user: any, index) => (
                                <li key={index} className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">{index + 1}. {user.name}</span>
                                    <span className="text-blue-600 font-bold">{Math.round(user.totalPoints)} pts</span>
                                </li>
                            ))}
                            {leaderboard.length === 0 && <p className="text-gray-500">No players yet. Be the first!</p>}
                        </ul>
                    </div>

                    {/* Match History */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">📜 Recent Matches</h2>
                        <ul className="space-y-4">
                            {history.map((quiz: any, index) => (
                                <li key={index} className="border p-4 rounded-md bg-gray-50">
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span>Room: {quiz.roomId}</span>
                                        <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-semibold text-gray-700">Winner: 
                                        <span className="text-green-600 ml-1">
                                            {quiz.leaderboard[0]?.name || "N/A"} ({Math.round(quiz.leaderboard[0]?.points || 0)} pts)
                                        </span>
                                    </div>
                                </li>
                            ))}
                            {history.length === 0 && <p className="text-gray-500">No completed matches found.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};