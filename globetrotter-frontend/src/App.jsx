import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const API_URL = "https://globetrotter-production.up.railway.app/api";

function App() {
    const [clues, setClues] = useState([]);
    const [options, setOptions] = useState([]);
    const [result, setResult] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [gameMode, setGameMode] = useState(null); // Stores selected mode
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const { width, height } = useWindowSize(); // For full-screen confetti

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
            setGameMode(null);
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
            setResult("❌ Server error. Please try again.");
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
                setResult(`🎉 Correct! Fun Fact: ${response.data.funFact}`);
                setScore((prev) => prev + 10);
                setCorrectAnswers((prev) => prev + 1);
            } else {
                setResult("😢 Incorrect! Try Again.");
                setScore((prev) => prev - 5);
                setIncorrectAnswers((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error verifying answer", error);
            setResult("❌ Server error. Please try again.");
        }
    }

    function startGame(mode, time = 0) {
        setGameMode(mode);
        setScore(0);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        if (mode === "timer") {
            setTimeLeft(time * 60);
            setTimer(true);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center text-white p-6">
            {result && result.startsWith("🎉") && <Confetti width={width} height={height} />}

            {!gameMode ? (
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        🌍 Globetrotter Challenge
                    </h1>
                    <p className="mb-6 text-lg">Choose how you want to play:</p>

                    <button 
                        onClick={() => startGame("timer", 1)} 
                        className="p-3 m-2 text-lg font-bold bg-red-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:bg-red-600"
                    >
                        ⏳ 1-Min Timer Mode
                    </button>

                    <button 
                        onClick={() => startGame("points")} 
                        className="p-3 m-2 text-lg font-bold bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:bg-green-600"
                    >
                        🎯 Points Mode
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-lg text-center">
                    {gameMode === "timer" && <p className="text-lg font-semibold mb-2">⏳ Time Left: {timeLeft} sec</p>}
                    <p className="text-lg font-semibold mb-2">✅ Correct: {correctAnswers} | ❌ Incorrect: {incorrectAnswers} | 🏆 Score: {score}</p>

                    <div className="bg-gray-800 text-gray-300 rounded-lg p-5 shadow-lg border border-gray-600 mb-6">
                        <p className="text-xl font-semibold">{clues.join(" / ")}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {options.map(option => (
                            <button 
                                key={option} 
                                onClick={() => handleAnswer(option)} 
                                className="p-3 text-lg font-bold bg-gray-900 text-blue-400 rounded-lg shadow-lg border border-blue-500 transition-all transform hover:scale-110 active:scale-95 hover:bg-blue-500 hover:text-white"
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {result && (
                        <div className="mt-6 bg-gray-900 text-gray-300 rounded-lg p-5 shadow-lg border border-gray-700">
                            <p className="text-xl font-semibold">{result}</p>
                        </div>
                    )}

                    {result && (
                        <button 
                            onClick={fetchDestination} 
                            className="p-3 mt-6 text-lg font-bold bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-110 active:scale-95 hover:bg-green-600"
                        >
                            🔄 Next Question
                        </button>
                    )}

                    <button 
                        onClick={() => setGameMode(null)} 
                        className="p-3 mt-6 text-lg font-bold bg-red-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-110 active:scale-95 hover:bg-red-600"
                    >
                        ⏹ Quit Game
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
