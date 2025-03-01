import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState("");

    useEffect(() => { fetchDestination(); }, []);

    async function fetchDestination() {
        try {
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name);
            setResult(null);
        } catch (error) {
            console.error("Error fetching destination", error);
            setResult("❌ Server error. Please try again.");
        }
    }    

    async function handleAnswer(selectedOption) {
        if (result) return;

        try {
            const response = await axios.post(`${API_URL}/destination/verify`, {
                answer: selectedOption,
                correctAnswer: correctAnswer,
            });

            if (response.data.correct) {
                setResult(`🎉 Correct! Fun Fact: ${response.data.funFact}`);
            } else {
                setResult("😢 Incorrect! Try Again.");
            }
        } catch (error) {
            console.error("Error verifying answer", error);
            setResult("❌ Server error. Please try again.");
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-300 to-purple-500 text-white p-6">
            {result && <Confetti />}
            
            <div className="max-w-3xl bg-white text-gray-900 rounded-2xl shadow-lg p-6">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-4">🌍 Globetrotter Challenge</h1>
                <p className="text-lg text-center mb-6 font-medium">{clues.join(" / ")}</p>

                <div className="grid grid-cols-2 gap-4">
                    {options.map(option => (
                        <button 
                            key={option} 
                            onClick={() => handleAnswer(option)} 
                            className="p-3 w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-xl transition-all shadow-md"
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {result && (
                    <div className="mt-6 p-4 text-center rounded-xl bg-gray-100 text-gray-800 text-lg font-semibold shadow-md">
                        {result}
                    </div>
                )}

                {result && (
                    <button 
                        onClick={fetchDestination} 
                        className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg transition-all"
                    >
                        Play Again
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;
