import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(""); // Store correct answer

    useEffect(() => { fetchDestination(); }, []);

    async function fetchDestination() {
        try {
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name);
            setResult(null); // Reset result when fetching new question
        } catch (error) {
            console.error("Error fetching destination", error);
            setResult("❌ Server error. Please try again.");
        }
    }    

    async function handleAnswer(selectedOption) {
        if (result) return; // Prevent multiple clicks when result is already displayed

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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 flex flex-col items-center justify-center text-white p-6">
            {result && <Confetti />}

            {/* Title */}
            <h1 className="text-4xl font-extrabold mb-6 tracking-wide text-center">
                🌍 Globetrotter Challenge
            </h1>

            {/* Clue Display */}
            <div className="bg-white text-gray-900 rounded-lg p-4 shadow-lg w-full max-w-lg text-center mb-6">
                <p className="text-lg font-semibold">{clues.join(" / ")}</p>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                {options.map(option => (
                    <button 
                        key={option} 
                        onClick={() => handleAnswer(option)} 
                        className="p-3 text-lg font-bold bg-white text-blue-600 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:bg-blue-100"
                    >
                        {option}
                    </button>
                ))}
            </div>

            {/* Result Display */}
            {result && (
                <div className="mt-6 bg-white text-gray-900 rounded-lg p-4 shadow-lg text-center w-full max-w-lg">
                    <p className="text-lg font-semibold">{result}</p>
                </div>
            )}

            {/* Play Again Button */}
            {result && (
                <button 
                    onClick={fetchDestination} 
                    className="p-3 mt-6 text-lg font-bold bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:bg-green-600"
                >
                    Play Again
                </button>
            )}
        </div>
    );
}

export default App;
