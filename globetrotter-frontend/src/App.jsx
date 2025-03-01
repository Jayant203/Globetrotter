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
    const [inviteLink, setInviteLink] = useState(null);
    const [inviter, setInviter] = useState(null);
    const [inviterScore, setInviterScore] = useState(null);

    // ✅ Detect if user joins via invite link
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get("invite");

        if (inviteCode) {
            axios.get(`${API_URL}/game/${inviteCode}`)
                .then(response => {
                    setInviter(response.data.inviter);
                    setInviterScore(response.data.score);
                })
                .catch(error => console.error("Error fetching game session", error));
        }
    }, []);

    // ✅ Register user
    async function registerUser() {
        if (!username) return alert("Please enter a username!");

        try {
            await axios.post(`${API_URL}/register`, { username });
            setIsRegistered(true);
        } catch (error) {
            console.error("Registration error", error);
        }
    }

    // ✅ Fetch a random destination
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

    // ✅ Handle answer selection
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

    // ✅ Start game modes
    function startGame(mode, time = 0) {
        setGameMode(mode);
        setScore(0);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        if (mode === "timer") {
            setTimeLeft(time * 60);
            setTimer(true);
        }
        fetchDestination();
    }

    // ✅ Timer logic
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

    // ✅ Generate an invite link
    async function challengeFriend() {
        try {
            const response = await axios.post(`${API_URL}/challenge`, { username, score });
            setInviteLink(response.data.inviteLink);
        } catch (error) {
            console.error("Challenge error", error);
        }
    }

    // ✅ End game
    function endGame() {
        setGameMode(null);
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white p-6 bg-black">
            <div className="absolute inset-0 bg-[url('https://i.imgur.com/jPmeI5A.png')] bg-cover bg-fixed opacity-40 z-0"></div>

            {result === "🎉 Correct!" && <Confetti />}

            {/* ✅ Username Registration */}
            {!isRegistered && (
                <div className="relative z-10 flex flex-col items-center">
                    <input 
                        type="text" 
                        placeholder="Enter your username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-3 text-lg rounded-lg bg-gray-800 text-white"
                    />
                    <button onClick={registerUser} className="p-3 mt-4 text-lg bg-blue-500 text-white rounded-lg">
                        ✅ Start Game
                    </button>
                </div>
            )}

            {/* ✅ Inviter Score Display */}
            {inviter && (
                <div className="p-3 bg-gray-800 text-white rounded-lg mt-4">
                    <p>🎉 You were invited by <strong>{inviter}</strong>!</p>
                    <p>They scored: <strong>{inviterScore} points</strong></p>
                </div>
            )}

            {/* ✅ Game Modes Selection */}
            {isRegistered && !gameMode && (
                <motion.div 
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 flex flex-col items-center text-center"
                >
                    <h1 className="text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg">
                        🌍 Globetrotter Challenge
                    </h1>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startGame("timer", 1)} 
                        className="p-4 m-2 text-lg font-bold bg-red-500 text-white rounded-full shadow-xl"
                    >
                        ⏳ 1-Min Timer Mode
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startGame("points")} 
                        className="p-4 m-2 text-lg font-bold bg-green-500 text-white rounded-full shadow-xl"
                    >
                        🎯 Points Mode
                    </motion.button>
                </motion.div>
            )}

            {/* ✅ Game Play */}
            {gameMode && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-lg text-center bg-black bg-opacity-60 rounded-lg p-6 shadow-lg border border-gray-600"
                >
                    {gameMode === "timer" && <p>⏳ Time Left: {timeLeft} sec</p>}
                    <p>✅ Correct: {correctAnswers} | ❌ Incorrect: {incorrectAnswers} | 🏆 Score: {score}</p>

                    <div className="bg-gray-800 text-gray-300 rounded-lg p-5 shadow-lg mb-6">
                        <p>{clues.join(" / ")}</p>
                    </div>

                    {options.map(option => (
                        <button key={option} onClick={() => handleAnswer(option)} className="p-3 m-2 bg-gray-900 text-yellow-400 rounded-lg">
                            {option}
                        </button>
                    ))}

                    <button onClick={challengeFriend} className="p-3 mt-4 bg-purple-500 text-white rounded-lg">
                        🚀 Challenge a Friend
                    </button>

                    {inviteLink && <p className="text-blue-400">{inviteLink}</p>}
                </motion.div>
            )}
        </div>
    );
}

export default App;
