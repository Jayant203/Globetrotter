const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema({
    alias: String,
    name: String,
    clues: [String],
    funFacts: [String]
});

module.exports = mongoose.model("Destination", DestinationSchema);
