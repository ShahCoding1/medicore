const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Basic API routes
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MediCore API is running successfully",
        timestamp: new Date().toISOString()
    });
});

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        name: "MediCore Healthcare Management API",
        version: "1.0.0",
        status: "active"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// MongoDB connection
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("");
        console.log("==========================================");
        console.log("       MEDICORE BACKEND SERVER");
        console.log("==========================================");
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`API:    http://localhost:${PORT}/api`);
        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );
        console.log("==========================================");
        console.log("");
    });
};

startServer();