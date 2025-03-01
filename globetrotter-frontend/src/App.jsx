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
    const [isRegistered, setIsRegistered] = useState(!!username);
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

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 2500);
    }, []);

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

    function startGame(mode) {
        setGameMode(mode);
        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setGameOver(false);
        fetchDestination(); // Load first question
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
                setResult("✅ Correct!");
                setScore((prev) => prev + 10);
                setCorrectCount((prev) => prev + 1);
            } else {
                setResult("❌ Incorrect!");
                setScore((prev) => prev - 5);
                setIncorrectCount((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error verifying answer", error);
        }
    }

    async function challengeFriend() {
        try {
            const response = await axios.post(`${API_URL}/challenge`, { username, score });
            setInviteLink(response.data.inviteLink);
        } catch (error) {
            console.error("Challenge error:", error);
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-black bg-white">
            {/* 🌍 3D Globe Animation */}
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
                        className="absolute text-7xl font-extrabold text-gray-800"
                    >
                        🌍 Globetrotter Challenge
                    </motion.h1>
                </div>
            ) : !isRegistered ? (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center text-center w-96 p-6"
                >
                    <h1 className="text-3xl font-bold mb-4 text-black">Enter Your Username</h1>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 text-lg rounded-lg bg-gray-200 text-black w-full text-center"
                    />
                    <button
                        onClick={() => {
                            localStorage.setItem("username", username);
                            setIsRegistered(true);
                        }}
                        className="p-4 mt-4 w-full glowing"
                    >
                        ✅ Start Game
                    </button>
                </motion.div>
            ) : !gameMode ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass flex flex-col items-center text-center p-6 w-[50vw]"
                >
                    <h1 className="text-5xl font-extrabold mb-6 text-gray-900">Choose Mode</h1>
                    <button onClick={() => startGame("timer")} className="p-5 m-4 text-xl w-full glowing">
                        ⏳ 1-Min Timer Mode
                    </button>
                    <button onClick={() => startGame("points")} className="p-5 m-4 text-xl w-full glowing">
                        🎯 Points Mode
                    </button>
                    <button onClick={challengeFriend} className="p-5 m-4 text-xl w-full glowing">
                        🎉 Challenge a Friend
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="glass text-center w-[70vw] p-8"
                >
                    <div className="p-6 text-3xl font-bold bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl mb-6 text-black">
                        {clues.join(" / ")}
                    </div>
                    <div className="grid grid-cols-2 gap-8 mt-6">
                        {options.map(option => (
                            <button 
                                key={option} 
                                className="p-5 glowing w-full text-lg border-2 border-gray-600 rounded-lg bg-gray-200 text-black"
                                onClick={() => handleAnswer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {result && <motion.div className="mt-6 text-xl font-bold">{result === "✅ Correct!" && <Confetti />} {result}</motion.div>}

                    {result && <button onClick={fetchDestination} className="p-3 mt-4 bg-blue-500 text-white rounded-lg">🔄 Next Question</button>}

                    <button onClick={handleQuit} className="p-3 mt-4 bg-red-500 text-white rounded-lg">⏹ Quit Game</button>
                </motion.div>
            )}
        </div>
    );
}

export default App;
