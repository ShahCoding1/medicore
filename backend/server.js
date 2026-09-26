const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

// ==========================================
// APP CONFIGURATION
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY & MIDDLEWARE
// ==========================================

app.use(helmet());

app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ],

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

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
// API INFORMATION
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

// ==========================================
// DASHBOARD ROUTES
// ==========================================

app.use(
    "/api/dashboard",
    dashboardRoutes
);

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
// PATIENT ROUTES
// ==========================================

app.use(
    "/api/patients",
    patientRoutes
);

// ==========================================
// DOCTOR ROUTES
// ==========================================

app.use(
    "/api/doctors",
    doctorRoutes
);

// ==========================================
// FUTURE ROUTES
// ==========================================
//
// Add future modules here one phase at a time.
//
// Example:
//
// const appointmentRoutes = require("./routes/appointmentRoutes");
//
// app.use(
//     "/api/appointments",
//     appointmentRoutes
// );
//
// Do NOT add future routes until their respective
// MediCore phase is implemented and verified.
//
// ==========================================

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
    try {
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
                    `Dashboard:    http://localhost:${PORT}/api/dashboard`
                );

                console.log(
                    `Staff:        http://localhost:${PORT}/api/staff`
                );

                console.log(
                    `Preferences:  http://localhost:${PORT}/api/preferences`
                );

                console.log(
                    `Patients:      http://localhost:${PORT}/api/patients`
                );

                console.log(
                    `Doctors:       http://localhost:${PORT}/api/doctors`
                );

                console.log(
                    "=========================================="
                );

                console.log("");
            }
        );

    } catch (error) {
        console.error(
            "Failed to start MediCore server:",
            error.message
        );

        process.exit(1);
    }
};

// ==========================================
// APPLICATION START
// ==========================================

startServer();