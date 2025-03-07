import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Confetti from "react-confetti";
import QRCode from "react-qr-code";
import './App.css'; // Import the CSS file for animations

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
    const [showAnimation, setShowAnimation] = useState(true); // New state variable

    useEffect(() => {
        setTimeout(() => setShowIntro(false), 3000);
    
        // ✅ If user is coming from an invite link, fetch inviter details
        const urlParams = new URLSearchParams(window.location.search);
        const inviteCode = urlParams.get("invite");
    
        if (inviteCode) {
            console.log("Fetching invite details for code:", inviteCode); // ✅ Debugging log
    
            axios.get(`${API_URL}/game/${inviteCode}`)
                .then(response => {
                    console.log("✅ Invite details received:", response.data); // ✅ Debugging log
                    setInviter(response.data.inviter);
                    setInviterScore(response.data.score);
                })
                .catch(error => console.error("❌ Error fetching inviter details:", error));
        }
    }, []);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAnimation(false); // Hide animation after 3 seconds
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

        // ✅ Timer for 1-Min Timer Mode
    useEffect(() => {
        if (gameMode === "timer" && timer > 0) {
            const countdown = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer === 1) {
                        clearInterval(countdown);
                        handleQuit(); // ✅ Auto-end game when timer hits 0
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
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
        setInvitePopup(false); // ✅ Hide invite popup when starting game mode
        setTimeout(() => {
            setGameMode(mode);
            setScore(0);
            setCorrectCount(0);
            setIncorrectCount(0);
            setGameOver(false);
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

    async function challengeFriend() {
        if (!username.trim()) {
            alert("Please enter a username first!");
            return;
        }
    
        try {
            console.log("✅ Sending request to invite a friend...");
            
            const response = await axios.post(`${API_URL}/game/challenge`, { 
                username, 
                score 
            });
    
            console.log("✅ Received invite link:", response.data.inviteLink);
            setInviteLink(response.data.inviteLink);
            setInvitePopup(true);
        } catch (error) {
            console.error("❌ Challenge error:", error.response ? error.response.data : error);
            alert("Error inviting friend. Please try again.");
        }
    }

    function copyInviteLink() {
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied! Share it with your friends.");
    }

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-200 text-gray-900">
            {showAnimation ? (
                <div className="globetrotter-animation">
                    Welcome to the Globetrotter Challenge!
                </div>
            ) : showIntro ? (
                <motion.h1 className="text-6xl font-extrabold">🌍 Globetrotter Challenge</motion.h1>
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
            ) : !gameMode ? (
                <motion.div className="glass flex flex-col items-center text-center p-6 w-96">
                    <h1 className="text-5xl font-extrabold mb-6">Choose Mode</h1>
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
                    {gameMode === "timer" && <p className="text-xl font-bold">⏳ Time Left: {timer}s</p>}
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
                            <button onClick={handleQuit} className="quit-button mt-4">⏹ Quit Game</button>
                        </>
                    )}
                </motion.div>
            )}

            {invitePopup && (
                <div className="invite-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white p-6 rounded-lg text-center">
                        <h2 className="text-2xl font-bold">🎉 Invite Your Friend!</h2>
                        <p className="mt-2">Send this link to your friend:</p>
                        <QRCode value={inviteLink} className="mt-4 mx-auto" />
                        <button onClick={copyInviteLink} className="mt-4 glowing">📋 Copy Link</button>
                        <button onClick={() => setInvitePopup(false)} className="quit-button mt-4">❌ Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;