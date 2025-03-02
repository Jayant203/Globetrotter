import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere } from "@react-three/drei"; // ✅ Added Sphere back
import Confetti from "react-confetti";
import QRCode from "react-qr-code";

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
    const [invitePopup, setInvitePopup] = useState(false);
    const [timer, setTimer] = useState(60);
    const [questionLoaded, setQuestionLoaded] = useState(false);
    const [inviter, setInviter] = useState(null);
    const [inviterScore, setInviterScore] = useState(null);

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 3000);

        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get("invite");

        if (inviteCode) {
            axios.get(`${API_URL}/game/${inviteCode}`)
                .then(response => {
                    setInviter(response.data.inviter);
                    setInviterScore(response.data.score);
                })
                .catch(error => console.error("Error fetching inviter details:", error));
        }
    }, []);

    useEffect(() => {
        let countdown;
        if (gameMode === "timer" && timer > 0) {
            countdown = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            handleQuit(); // ✅ Call handleQuit when timer reaches zero
        }
        return () => clearInterval(countdown);
    }, [gameMode, timer]);

    async function fetchDestination() {
        try {
            setQuestionLoaded(false);
            const response = await axios.get(`${API_URL}/destination/random`);
            setClues(response.data.clues);
            setOptions(response.data.options);
            setCorrectAnswer(response.data.name);
            setResult(null);
            setQuestionLoaded(true);
        } catch (error) {
            console.error("Error fetching destination", error);
        }
    }

    function startGame(mode) {
        setGameMode(null);
        setInvitePopup(false);
        setGameOver(false); // ✅ Ensure leaderboard resets when game starts
        setTimeout(() => {
            setGameMode(mode);
            setScore(0);
            setCorrectCount(0);
            setIncorrectCount(0);
            setTimer(60);
            fetchDestination();
        }, 500);
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

            setTimeout(fetchDestination, gameMode === "timer" ? 600 : 1000);
        } catch (error) {
            console.error("Error verifying answer", error);
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-200 text-gray-900">
            {showIntro ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Canvas>
                        <OrbitControls enableZoom={false} />
                        <Stars />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[2, 5, 2]} intensity={1} />
                        <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
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
            ) : gameOver ? (
                <motion.div className="glass flex flex-col items-center text-center p-6 w-96">
                    <h1 className="text-5xl font-extrabold mb-4">Game Over 🎮</h1>
                    <p className="text-xl">✅ Correct: {correctCount} | ❌ Incorrect: {incorrectCount}</p>
                    <p className="text-xl font-bold">🏆 Final Score: {score}</p>
                    <button onClick={() => setGameOver(false)} className="restart-button">
                        🔄 Play Again
                    </button>
                </motion.div>
            ) : !isRegistered ? (
                <motion.div className="glass flex flex-col items-center text-center w-96">
                    <h2 className="text-2xl font-bold mb-2">Let's start with the trivia!</h2>
                    
                    {inviter && inviterScore !== null && (
                        <p className="text-lg text-gray-700 mb-4">
                            <strong>{inviter}</strong> has invited you! Their score is <strong>{inviterScore}</strong>.
                        </p>
                    )}
                    
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 text-lg rounded-lg bg-white text-gray-900 w-full text-center border"
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
            ) : null}

            {invitePopup && (
                <div className="invite-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white p-6 rounded-lg text-center">
                        <h2 className="text-2xl font-bold">🎉 Invite Your Friend!</h2>
                        <QRCode value={inviteLink} className="mt-4 mx-auto" />
                        <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="mt-4 glowing">
                            📋 Copy Link
                        </button>
                        <button onClick={() => setInvitePopup(false)} className="quit-button mt-4">❌ Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
