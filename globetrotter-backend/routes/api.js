const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ User Registration Route
router.post("/register", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username });
            await user.save();
        }

        res.json({ message: "User registered successfully", user });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
