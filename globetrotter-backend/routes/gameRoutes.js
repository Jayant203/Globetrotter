const express = require("express");
const router = express.Router();
const User = require("../models/User");
const GameSession = require("../models/GameSession");
const crypto = require("crypto");

const FRONTEND_URL = "https://mellow-magic-production.up.railway.app"; // ✅ Ensure correct frontend URL

// ✅ Ensure user is registered before inviting
router.post("/challenge", async (req, res) => {
    const { username, score } = req.body;

    try {
        let user = await User.findOne({ username });
        
        // ✅ If the user is not found, create a new user instead of returning an error
        if (!user) {
            user = new User({ username });
            await user.save();
        }

        // Generate unique invite code
        const inviteCode = crypto.randomBytes(4).toString("hex");

        // Save game session
        const gameSession = new GameSession({
            inviter: user._id,
            score,
            inviteCode
        });
        await gameSession.save();

        res.json({ inviteLink: `${FRONTEND_URL}/?invite=${inviteCode}` });

    } catch (error) {
        console.error("Challenge error:", error);
        res.status(500).json({ error: "Server error" });
    }
});



// ✅ Retrieve game session details using invite link
router.get("/:inviteCode", async (req, res) => {
    const { inviteCode } = req.params;

    try {
        const session = await GameSession.findOne({ inviteCode }).populate({
            path: "inviter",
            select: "username" // ✅ Fetch only inviter's username
        });

        if (!session) {
            return res.status(404).json({ error: "Invalid invite link" });
        }

        res.json({
            inviter: session.inviter ? session.inviter.username : "Unknown", // ✅ Fix: Ensure inviter exists
            score: session.score
        });

    } catch (error) {
        console.error("Game session error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
