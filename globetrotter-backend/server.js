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
        if (!user) {
            return res.status(404).json({ error: "User not registered!" });
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

        // ✅ FIX: Ensure correct path
        res.json({ inviteLink: `${FRONTEND_URL}/game/${inviteCode}` });

    } catch (error) {
        console.error("Challenge error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Retrieve game session details using invite link
router.get("/game/:inviteCode", async (req, res) => {
    const { inviteCode } = req.params;

    try {
        const session = await GameSession.findOne({ inviteCode }).populate("inviter");
        if (!session) return res.status(404).json({ error: "Invalid invite link" });

        res.json({
            inviter: session.inviter.username,
            score: session.score
        });

    } catch (error) {
        console.error("Game session error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
