import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    // ✅ State variables to store game data
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(""); // ✅ Store correct answer

    useEffect(() => { fetchDestination(); }, []);

    async function fetchDestination() {
        try {
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name); // ✅ Store correct answer
            setResult(null); // ✅ Reset result when fetching new question
        } catch (error) {
            console.error("Error fetching destination", error);
            setResult("❌ Server error. Please try again.");
        }
    }    

    // ✅ Correctly define `handleAnswer` inside the component
    async function handleAnswer(selectedOption) {
        try {
            const response = await axios.post(`${API_URL}/destination/verify`, {
                answer: selectedOption,
                correctAnswer: correctAnswer, // ✅ Send correct answer
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
        <div className="min-h-screen bg-blue-100 flex flex-col items-center p-4">
            {result && <Confetti />}
            <h1 className="text-3xl font-bold mb-4">🌍 Globetrotter Challenge</h1>
            <p className="text-lg mb-4">{clues.join(" / ")}</p>

            {options.map(option => (
                <button key={option} onClick={() => handleAnswer(option)} className="p-2 m-2 bg-black text-white rounded">
                    {option}
                </button>
            ))}

            {result && <p className="mt-4 text-lg font-semibold">{result}</p>}

            <button onClick={fetchDestination} className="p-2 mt-4 bg-blue-500 text-white rounded">
                Play Again
            </button>
        </div>
    );
}

export default App;