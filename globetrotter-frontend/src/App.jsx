import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [username, setUsername] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [gameMode, setGameMode] = useState(null);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 2000);
    }, []);

    useEffect(() => {
        if (gameMode) fetchDestination();
    }, [gameMode]);

    async function fetchDestination() {
        try {
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name);
            setResult(null);
        } catch (error) {
            console.error("Error fetching destination", error);
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full text-white">
            {/* 🔥 Animated Background */}
            <div className="bg-animate"></div>

            {showIntro ? (
                <motion.div
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center text-center"
                >
                    <h1 className="text-7xl font-extrabold text-white">🌍 Globetrotter Challenge</h1>
                </motion.div>
            ) : !isRegistered ? (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center text-center w-96"
                >
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 text-lg rounded-lg bg-gray-800 text-white w-full text-center"
                    />
                    <button onClick={() => setIsRegistered(true)} className="p-4 mt-4 w-full glowing">
                        ✅ Start Game
                    </button>
                </motion.div>
            ) : !gameMode ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center text-center p-6 w-96"
                >
                    <h1 className="text-5xl font-extrabold mb-6 text-white">Choose Mode</h1>
                    <button onClick={() => setGameMode("timer")} className="p-5 m-4 text-xl w-full glowing">
                        ⏳ 1-Min Timer Mode
                    </button>
                    <button onClick={() => setGameMode("points")} className="p-5 m-4 text-xl w-full glowing">
                        🎯 Points Mode
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass text-center w-full max-w-2xl p-6"
                >
                    <p className="text-xl mb-4">{clues.join(" / ")}</p>
                    <div className="grid grid-cols-2 gap-6">
                        {options.map(option => (
                            <button key={option} className="p-4 glowing w-full text-lg">
                                {option}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default App;
