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
    let incorrectOptions = await Destination.aggregate([
        { $match: { name: { $ne: correctAnswer } } }, // Exclude correct answer
        { $sample: { size: 5 } } // Get more than needed to account for duplicates
    ]).exec();

    let optionSet = new Set(incorrectOptions.map(dest => dest.name));
    
    // Ensure we have exactly 3 incorrect answers
    let options = Array.from(optionSet).slice(0, 3);
    
    // Add correct answer
    options.push(correctAnswer);
    
    // Shuffle
    return options.sort(() => Math.random() - 0.5);
}

module.exports = router;