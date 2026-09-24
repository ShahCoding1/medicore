const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const patientRoutes = require("./routes/patientRoutes");



const app = express();
const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(helmet());

app.use("/api/patients", patientRoutes);
app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MediCore API is running successfully",
        timestamp: new Date().toISOString()
    });
});


// ==========================================
// API INFO
// ==========================================

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        name: "MediCore Healthcare Management API",
        version: "1.0.0",
        status: "active"
    });
});


// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);


// ==========================================
// HOSPITAL ROUTES
// ==========================================

app.use(
    "/api/hospitals",
    hospitalRoutes
);


// ==========================================
// DEPARTMENT ROUTES
// ==========================================

app.use(
    "/api/departments",
    departmentRoutes
);
app.use("/api/dashboard", dashboardRoutes);


// ==========================================
// STAFF ROUTES
// ==========================================

app.use(
    "/api/staff",
    staffRoutes
);


// ==========================================
// PREFERENCE ROUTES
// ==========================================

app.use(
    "/api/preferences",
    preferenceRoutes
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
    (error, req, res, next) => {
        console.error(
            "MediCore API Error:",
            error
        );

        res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "An unexpected server error occurred."
        });
    }
);


// ==========================================
// MONGODB CONNECTION
// ==========================================

const connectDB = async () => {
    try {
        const connection =
            await mongoose.connect(
                process.env.MONGO_URI
            );

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


// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {

    await connectDB();

    app.listen(
        PORT,
        () => {

            console.log("");

            console.log(
                "=========================================="
            );

            console.log(
                "       MEDICORE BACKEND SERVER"
            );

            console.log(
                "=========================================="
            );

            console.log(
                `Server:       http://localhost:${PORT}`
            );

            console.log(
                `API:          http://localhost:${PORT}/api`
            );

            console.log(
                `Health:       http://localhost:${PORT}/api/health`
            );

            console.log(
                `Auth:         http://localhost:${PORT}/api/auth`
            );

            console.log(
                `Hospital:     http://localhost:${PORT}/api/hospitals`
            );

            console.log(
                `Departments:  http://localhost:${PORT}/api/departments`
            );

            console.log(
                `Staff:        http://localhost:${PORT}/api/staff`
            );

            console.log(
                `Preferences:  http://localhost:${PORT}/api/preferences`
            );

            console.log(
                "=========================================="
            );

            console.log("");
        }
    );
};


startServer();