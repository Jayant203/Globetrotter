import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
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
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showIntro, setShowIntro] = useState(true);

    // Load intro animation first
    useEffect(() => {
        setTimeout(() => {
            setShowIntro(false);
        }, 3000); // 3-second intro animation
    }, []);

    useEffect(() => { 
        if (gameMode) fetchDestination(); 
    }, [gameMode]);

    useEffect(() => {
        if (timer && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(interval);
        } else if (timeLeft === 0 && gameMode === "timer") {
            endGame();
        }
    }, [timeLeft, timer]);

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

    async function handleAnswer(selectedOption) {
        if (result) return;

        try {
            const response = await axios.post(`${API_URL}/destination/verify`, {
                answer: selectedOption,
                correctAnswer: correctAnswer,
            });

            if (response.data.correct) {
                setResult("🎉 Correct!");
                setScore((prev) => prev + 10);
                setCorrectAnswers((prev) => prev + 1);
            } else {
                setResult("❌ Incorrect!");
                setScore((prev) => prev - 5);
                setIncorrectAnswers((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error verifying answer", error);
        }
    }

    function startGame(mode, time = 0) {
        setGameMode(mode);
        setScore(0);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        setShowLeaderboard(false);
        if (mode === "timer") {
            setTimeLeft(time * 60);
            setTimer(true);
        }
    }

    function endGame() {
        setLeaderboard([...leaderboard, { score, correctAnswers }]);
        setShowLeaderboard(true);
        setGameMode(null);
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white p-6 bg-black overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-indigo-900 animate-pulse opacity-50 z-0"></div>

            {showIntro ? (
                // Intro Animation (Globe & Title Appearing)
                <motion.div 
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 flex flex-col items-center justify-center"
                >
                    <motion.img 
                        src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Globe_icon.svg"
                        alt="Globe"
                        className="w-32 h-32 animate-spin"
                    />
                    <h1 className="text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500">
                        Globetrotter Challenge
                    </h1>
                </motion.div>
            ) : !gameMode && !showLeaderboard ? (
                // Game Modes Selection (After Intro)
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 flex flex-col items-center text-center"
                >
                    <h1 className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500">
                        🌍 Globetrotter Challenge
                    </h1>
                    <p className="text-lg mb-6">Choose your game mode:</p>

                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startGame("timer", 1)} 
                        className="p-4 m-2 text-lg font-bold bg-red-500 text-white rounded-full shadow-xl hover:shadow-red-500"
                    >
                        ⏳ 1-Min Timer Mode
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startGame("points")} 
                        className="p-4 m-2 text-lg font-bold bg-green-500 text-white rounded-full shadow-xl hover:shadow-green-500"
                    >
                        🎯 Points Mode
                    </motion.button>
                </motion.div>
            ) : (
                // Game Play UI
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-lg text-center bg-black bg-opacity-60 rounded-lg p-6 shadow-lg border border-gray-600"
                >
                    {gameMode === "timer" && <p className="text-lg mb-2">⏳ Time Left: {timeLeft} sec</p>}
                    <p className="text-lg mb-2">✅ Correct: {correctAnswers} | ❌ Incorrect: {incorrectAnswers} | 🏆 Score: {score}</p>

                    <div className="bg-gray-800 text-gray-300 rounded-lg p-5 shadow-lg border border-gray-600 mb-6">
                        <p className="text-xl font-semibold">{clues.join(" / ")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {options.map(option => (
                            <motion.button 
                                key={option} 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAnswer(option)} 
                                className="p-3 text-lg font-bold bg-gray-900 text-yellow-400 rounded-full shadow-lg border border-yellow-500"
                            >
                                {option}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default App;
