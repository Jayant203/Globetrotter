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

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white">
            {/* 🔥 Animated Background */}
            <div className="bg-animate"></div>

            {showIntro ? (
                <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center text-center"
                >
                    <h1 className="text-7xl font-extrabold text-white">🌍 Globetrotter Challenge</h1>
                </motion.div>
            ) : !isRegistered ? (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center p-6 text-center"
                >
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 text-lg rounded-lg bg-gray-800 text-white w-80 text-center"
                    />
                    <button onClick={() => setIsRegistered(true)} className="p-4 mt-4 w-80 glowing">
                        ✅ Start Game
                    </button>
                </motion.div>
            ) : !gameMode ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center text-center p-6"
                >
                    <h1 className="text-6xl font-extrabold mb-6 text-white">Choose Game Mode</h1>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setGameMode("timer")}
                        className="p-5 m-4 text-xl font-bold w-96 glowing"
                    >
                        ⏳ 1-Min Timer Mode
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setGameMode("points")}
                        className="p-5 m-4 text-xl font-bold w-96 glowing"
                    >
                        🎯 Points Mode
                    </motion.button>
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
                            <button key={option} className="p-4 glowing w-80 text-lg">
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
