import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => { fetchDestination(); }, []);

    async function fetchDestination() {
        const response = await axios.get(`${API_URL}/destination/random`);
        setClues(response.data.clues);
        setOptions(response.data.options);
        setCorrectAnswer(response.data.name); // ✅ Store correct answer
    }    

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center">
            {result && <Confetti />}
            <h1 className="text-3xl font-bold">🌍 Globetrotter Challenge</h1>
            <p>{clues.join(" / ")}</p>
            {options.map(option => (
                <button key={option} onClick={() => handleAnswer(option)} className="p-2 m-2 bg-black text-white rounded">
                    {option}
                </button>
            ))}
        </div>
    );
}

async function handleAnswer(selectedOption) {
    try {
        const response = await axios.post(`${API_URL}/destination/verify`, {
            answer: selectedOption,
            correctAnswer: clues[0], // Assuming the first clue is the correct answer
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


export default App;
