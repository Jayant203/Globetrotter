const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: Number,
    inviteCode: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameSession", gameSessionSchema);
