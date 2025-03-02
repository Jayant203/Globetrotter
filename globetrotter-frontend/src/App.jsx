import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere } from "@react-three/drei";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [isRegistered, setIsRegistered] = useState(false);
    const [gameMode, setGameMode] = useState(null);
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [timer, setTimer] = useState(60);
    const [questionLoaded, setQuestionLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 3000);
    }, []);

    // ✅ Timer only starts after the question loads
    useEffect(() => {
        if (gameMode === "timer" && questionLoaded) {
            const interval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        setGameOver(true);
                        setGameMode(null); // ✅ Redirect to mode selection after quitting
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [gameMode, questionLoaded]);

    async function fetchDestination() {
        try {
            setQuestionLoaded(false); // ✅ Prevents buttons from appearing before question loads
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name);
            setResult(null);
            setQuestionLoaded(true); // ✅ Ensures question is ready before showing buttons
        } catch (error) {
            console.error("Error fetching destination", error);
        }
    }

    function startGame(mode) {
        setGameMode(null); // ✅ Ensures proper mode reset
        setTimeout(() => {
            setGameMode(mode);
            setScore(0);
            setCorrectCount(0);
            setIncorrectCount(0);
            setGameOver(false);
            setTimer(60);
            fetchDestination();
        }, 500); // ✅ Small delay ensures smooth transition
    }

    function handleQuit() {
        setGameOver(true);
        setGameMode(null);
    }

    async function handleAnswer(selectedOption) {
        if (result) return;

        try {
            const response = await axios.post(`${API_URL}/destination/verify`, {
                answer: selectedOption,
                correctAnswer: correctAnswer,
            });

            if (response.data.correct) {
                setResult("✅ Correct! 🎉");
                setScore(prev => prev + 10);
                setCorrectCount(prev => prev + 1);
            } else {
                setResult("❌ Incorrect! 😞");
                setScore(prev => prev - 5);
                setIncorrectCount(prev => prev + 1);
            }

            // ✅ Faster transition to next question
            setTimeout(fetchDestination, gameMode === "timer" ? 600 : 1000);
        } catch (error) {
            console.error("Error verifying answer", error);
        }
    }

    async function challengeFriend() {
        try {
            const response = await axios.post(`${API_URL}/game/challenge`, { username, score });
            setInviteLink(response.data.inviteLink);
        } catch (error) {
            console.error("Challenge error:", error);
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-gray-900 bg-gray-100">
            {showIntro ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Canvas>
                        <OrbitControls enableZoom={false} />
                        <Stars />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[2, 5, 2]} intensity={1} />
                        <Sphere args={[1.5, 32, 32]}>
                            <meshStandardMaterial color="blue" />
                        </Sphere>
                    </Canvas>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute text-6xl font-extrabold"
                    >
                        🌍 Globetrotter Challenge
                    </motion.h1>
                </div>
            ) : !isRegistered ? (
                <motion.div className="glass flex flex-col items-center text-center w-96">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 text-lg rounded-lg bg-gray-800 text-white w-full text-center"
                    />
                    <button
                        onClick={() => {
                            if (username.trim() !== "") {
                                localStorage.setItem("username", username);
                                setIsRegistered(true);
                            } else {
                                alert("Please enter a valid username!");
                            }
                        }}
                        className="p-4 mt-4 w-full glowing"
                    >
                        ✅ Start Game
                    </button>
                </motion.div>
            ) : gameOver ? (
                <motion.div className="glass flex flex-col items-center text-center p-6 w-96">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Game Over 🎮</h1>
                    <p className="text-xl">🏆 Final Score: {score}</p>
                    <p>✅ Correct Answers: {correctCount}</p>
                    <p>❌ Incorrect Answers: {incorrectCount}</p>
                    <button onClick={() => startGame("points")} className="restart-button">
                        🔄 Restart Game
                    </button>
                </motion.div>
            ) : !gameMode ? (
                <motion.div className="glass flex flex-col items-center text-center p-6 w-96">
                    <h1 className="text-5xl font-extrabold mb-6 text-gray-900">Choose Mode</h1>
                    <button onClick={() => startGame("timer")} className="glowing">
                        ⏳ 1-Min Timer Mode
                    </button>
                    <button onClick={() => startGame("points")} className="glowing">
                        🎯 Points Mode
                    </button>
                    <button onClick={challengeFriend} className="glowing">
                        🎉 Challenge a Friend
                    </button>
                </motion.div>
            ) : (
                <motion.div className="glass text-center w-full max-w-2xl p-6">
                    {questionLoaded && gameMode === "timer" && (
                        <p className="absolute top-4 right-4 text-2xl font-bold">⏳ {timer}s</p>
                    )}

                    <div className="question-box">{clues.join(" / ")}</div>

                    {questionLoaded && (
                        <div className="button-container mt-6">
                            {options.map(option => (
                                <button key={option} className="glowing" onClick={() => handleAnswer(option)}>
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {result && <motion.div className="mt-6 text-xl font-bold">{result}</motion.div>}

                    {result && result.includes("✅") && <Confetti />}

                    {questionLoaded && (
                        <>
                            <button onClick={fetchDestination} className="restart-button">🔄 Next Question</button>
                            <button onClick={handleQuit} className="quit-button">⏹ Quit Game</button>
                        </>
                    )}
                </motion.div>
            )}
        </div>
    );
}

export default App;
