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
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center">
            {result && <Confetti />}
            <h1 className="text-3xl font-bold">🌍 Globetrotter Challenge</h1>
            <p>{clues.join(" / ")}</p>
            {options.map(option => (
                <button key={option}>{option}</button>
            ))}
        </div>
    );
}

export default App;
