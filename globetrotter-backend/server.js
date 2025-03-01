require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Allowed Origins for CORS (Change this to match your frontend URL)
const allowedOrigins = [
    "https://mellow-magic-production.up.railway.app", // Deployed Frontend
    "http://localhost:5173"  // Local Dev Environment
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("❌ Not allowed by CORS"));
        }
    }
}));

app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.use("/api/destination", require("./routes/destination"));
app.use("/api", require("./routes/api"));

// ✅ Fix: Use gameRoutes correctly
const gameRoutes = require("./routes/gameRoutes");
app.use("/api/game", gameRoutes);

// ✅ Serve Frontend in Production Mode
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "client", "build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
