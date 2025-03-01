import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere } from "@react-three/drei";
import Confetti from "react-confetti";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [username, setUsername] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [gameMode, setGameMode] = useState(null);
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 3000);
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
        fetchDestination(); // ✅ Fetch the first question after selecting mode
    }

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center text-white">
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
                        className="absolute text-6xl font-extrabold"
                    >
                        🌍 Globetrotter Challenge
                    </motion.h1>
                </div>
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
                    <button onClick={() => startGame("timer")} className="p-5 m-4 text-xl w-full glowing">
                        ⏳ 1-Min Timer Mode
                    </button>
                    <button onClick={() => startGame("points")} className="p-5 m-4 text-xl w-full glowing">
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
