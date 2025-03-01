const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");

// ✅ Get a random destination
router.get("/random", async (req, res) => {
    try {
        const count = await Destination.countDocuments();
        const random = Math.floor(Math.random() * count);
        const destination = await Destination.findOne().skip(random);

        res.json({
            name: destination.name, // ✅ Send correct answer
            clues: destination.clues,
            options: await getRandomOptions(destination.name),
        });
    } catch (error) {
        console.error("Error fetching destination:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Verify answer
router.post("/verify", async (req, res) => {
    const { answer, correctAnswer } = req.body;

    try {
        if (answer === correctAnswer) {
            const destination = await Destination.findOne({ name: correctAnswer });
            return res.json({ correct: true, funFact: destination.funFacts[0] });
        } else {
            return res.json({ correct: false, message: "Oops! Try again." });
        }
    } catch (error) {
        console.error("Error verifying answer:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Generate Random Unique Options
async function getRandomOptions(correctAnswer) {
    let options = await Destination.aggregate([
        { $match: { name: { $ne: correctAnswer } } }, // Exclude correct answer
        { $sample: { size: 3 } } // Get 3 random incorrect options
    ]).exec();
    
    options = new Set(options.map(dest => dest.name)); // Ensure uniqueness
    options.add(correctAnswer); // Add correct answer
    
    // Convert back to an array and ensure exactly 4 options
    options = Array.from(options).slice(0, 4);
    
    return options.sort(() => Math.random() - 0.5); // Shuffle options
}

module.exports = router;