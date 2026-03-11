import { useState } from "react"

export const CreateProblem = ({socket, roomId}: {socket: any; roomId: string;}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [answer, setAnswer] = useState(0);
    const [options, setOptions] = useState([
        { id: 0, title: "" },
        { id: 1, title: "" },
        { id: 2, title: "" },
        { id: 3, title: "" }
    ]);

    const handleAddProblem = () => {
        socket.emit("createProblem", {
            roomId,
            problem: {
                title,
                description,
                options,
                answer,
            }
        });
        // This alert is crucial! It tells you the problem was actually sent to the backend.
        alert("Problem added successfully! You can now click Next Problem.");
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Add a New Problem</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                    <input 
                        type="text" 
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. What is the time complexity of QuickSort?"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide any additional context or code snippets..."
                        rows={2}
                    />
                </div>
                
                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options & Correct Answer</label>
                    <p className="text-xs text-gray-500 mb-3">Select the radio button next to the correct answer.</p>
                    
                    <div className="space-y-3">
                        {[0, 1, 2, 3].map(optionId => (
                            <div key={optionId} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md border border-gray-200">
                                <input 
                                    type="radio" 
                                    checked={optionId === answer} 
                                    onChange={() => setAnswer(optionId)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    onChange={(e) => {
                                        setOptions(options => options.map(x => {
                                            if (x.id === optionId) return { ...x, title: e.target.value }
                                            return x;
                                        }))
                                    }}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Option ${optionId + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
         
                <button 
                    onClick={handleAddProblem}
                    className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md hover:bg-blue-700 transition duration-200 mt-4"
                >
                    Save Problem to Bank
                </button>       
            </div>
        </div>
    );
}