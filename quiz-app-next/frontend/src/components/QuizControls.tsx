export const QuizControls = ({socket, roomId}: {socket: any, roomId: string}) => {
    
    const handleNextProblem = () => {
        // 1. Tell the backend to push the question
        socket.emit("next", {
            roomId
        });

        // 2. Show a massive alert to the Admin so they know it worked!
        alert("🚀 COMMAND SENT!\n\nIf this is the first question, the quiz has officially started. \n\n⚠️ PLAYERS NOW HAVE EXACTLY 20 SECONDS TO ANSWER! ⚠️\n\nGo check your Player tabs quickly!");
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎮 Game Controls</h3>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6 flex-1">
                <h4 className="font-semibold text-blue-800 mb-2">How to host:</h4>
                <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                    <li>Share the Room ID with your players.</li>
                    <li>Wait for them to join the lobby.</li>
                    <li>Click <b>Save Problem</b> to add a question to the database!</li>
                    <li>Click the button below to push the question to all players.</li>
                </ul>
                
                <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-xs font-semibold">
                    🚨 NOTE: Once you click Start, players have exactly 20 seconds to answer before the leaderboard automatically appears!
                </div>
            </div>

            <button 
                onClick={handleNextProblem}
                className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-md shadow-md hover:bg-green-700 hover:shadow-lg transition duration-200 active:scale-95"
            >
                Next Problem / Start Quiz 🚀
            </button>
        </div>
    );
}