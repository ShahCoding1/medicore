const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const pharmacyRoutes = require("./routes/pharmacyRoutes");
const labTestRoutes = require("./routes/labTestRoutes");

const invoiceRoutes = require("./routes/invoiceRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const bedRoutes = require("./routes/bedRoutes");
const dischargeRoutes = require("./routes/dischargeRoutes");

const roleRoutes = require("./routes/roleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const searchRoutes = require("./routes/searchRoutes");

// ============================================================
// APPLICATION CONFIGURATION
// ============================================================

const app = express();

const PORT = process.env.PORT || 5000;

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(helmet());

// ============================================================
// CORS
// ============================================================

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
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

// ============================================================
// LOGGING
// ============================================================

app.use(
    morgan("dev")
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "MediCore API is running successfully",
            timestamp: new Date().toISOString()
        });
    }
);

// ============================================================
// API INFORMATION
// ============================================================

app.get(
    "/api",
    (req, res) => {
        res.status(200).json({
            success: true,
            name: "MediCore Healthcare Management API",
            version: "1.0.0",
            status: "active"
        });
    }
);

// ============================================================
// AUTHENTICATION
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

// ============================================================
// HOSPITAL
// ============================================================

app.use(
    "/api/hospitals",
    hospitalRoutes
);

// ============================================================
// DEPARTMENTS
// ============================================================

app.use(
    "/api/departments",
    departmentRoutes
);

// ============================================================
// DASHBOARD
// ============================================================

app.use(
    "/api/dashboard",
    dashboardRoutes
);

// ============================================================
// STAFF
// ============================================================

app.use(
    "/api/staff",
    staffRoutes
);

// ============================================================
// PREFERENCES
// ============================================================

app.use(
    "/api/preferences",
    preferenceRoutes
);

// ============================================================
// PATIENTS
// ============================================================

app.use(
    "/api/patients",
    patientRoutes
);

// ============================================================
// DOCTORS
// ============================================================

app.use(
    "/api/doctors",
    doctorRoutes
);

// ============================================================
// APPOINTMENTS
// ============================================================

app.use(
    "/api/appointments",
    appointmentRoutes
);

// ============================================================
// MEDICAL RECORDS
// ============================================================

app.use(
    "/api/medical-records",
    medicalRecordRoutes
);

// ============================================================
// PRESCRIPTIONS
// ============================================================

app.use(
    "/api/prescriptions",
    prescriptionRoutes
);

// ============================================================
// PHARMACY INVENTORY
// ============================================================

app.use(
    "/api/pharmacy/inventory",
    pharmacyRoutes
);

// ============================================================
// LABORATORY TESTS
// ============================================================

app.use(
    "/api/laboratory/tests",
    labTestRoutes
);

// ============================================================
// BILLING / INVOICES
// ============================================================

app.use(
    "/api/billing",
    invoiceRoutes
);

// ============================================================
// ADMISSIONS
// ============================================================

app.use(
    "/api/admissions",
    admissionRoutes
);

// ============================================================
// BEDS
// ============================================================

app.use(
    "/api/beds",
    bedRoutes
);

// ============================================================
// DISCHARGES
// ============================================================

app.use(
    "/api/discharges",
    dischargeRoutes
);

// ============================================================
// ROLES & PERMISSIONS
// ============================================================

app.use(
    "/api/roles",
    roleRoutes
);

// ============================================================
// NOTIFICATIONS
// ============================================================

app.use(
    "/api/notifications",
    notificationRoutes
);

// ============================================================
// ANALYTICS
// ============================================================

app.use(
    "/api/analytics",
    analyticsRoutes
);

// ============================================================
// REPORTS
// ============================================================

app.use(
    "/api/reports",
    reportRoutes
);

// ============================================================
// AUDIT LOGS
// ============================================================

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

// ============================================================
// GLOBAL SEARCH
// ============================================================

app.use(
    "/api/search",
    searchRoutes
);

// ============================================================
// 404 API HANDLER
// ============================================================

app.use(
    (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({
                success: false,
                message: `API route not found: ${req.method} ${req.originalUrl}`
            });
        }

        next();
    }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (error, req, res, next) => {
        console.error(
            "MediCore API Error:",
            error
        );

        const statusCode =
            error.status ||
            error.statusCode ||
            500;

        res.status(statusCode).json({
            success: false,
            message:
                error.message ||
                "An unexpected server error occurred."
        });
    }
);

// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is not defined in the environment variables."
            );
        }

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("");
        console.log("==========================================");
        console.log("       MONGODB CONNECTION");
        console.log("==========================================");
        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );
        console.log(
            `Database:          ${connection.connection.name}`
        );
        console.log("==========================================");
        console.log("");

        return connection;

    } catch (error) {
        console.error("");
        console.error("==========================================");
        console.error("       MONGODB CONNECTION FAILED");
        console.error("==========================================");
        console.error(
            "MongoDB connection failed:",
            error.message
        );
        console.error("==========================================");
        console.error("");

        throw error;
    }
};

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
    try {
        await connectDB();

        app.listen(
            PORT,
            () => {
                console.log("");
                console.log("==========================================");
                console.log("       MEDICORE BACKEND SERVER");
                console.log("==========================================");
                console.log(
                    `Server:          http://localhost:${PORT}`
                );
                console.log(
                    `API:             http://localhost:${PORT}/api`
                );
                console.log(
                    `Health:          http://localhost:${PORT}/api/health`
                );
                console.log("------------------------------------------");
                console.log("AUTH & CORE");
                console.log(
                    `Auth:            http://localhost:${PORT}/api/auth`
                );
                console.log(
                    `Hospitals:       http://localhost:${PORT}/api/hospitals`
                );
                console.log(
                    `Departments:     http://localhost:${PORT}/api/departments`
                );
                console.log(
                    `Dashboard:       http://localhost:${PORT}/api/dashboard`
                );
                console.log(
                    `Staff:            http://localhost:${PORT}/api/staff`
                );
                console.log(
                    `Preferences:     http://localhost:${PORT}/api/preferences`
                );
                console.log("------------------------------------------");
                console.log("CLINICAL");
                console.log(
                    `Patients:        http://localhost:${PORT}/api/patients`
                );
                console.log(
                    `Doctors:         http://localhost:${PORT}/api/doctors`
                );
                console.log(
                    `Appointments:    http://localhost:${PORT}/api/appointments`
                );
                console.log(
                    `Medical Records: http://localhost:${PORT}/api/medical-records`
                );
                console.log(
                    `Prescriptions:   http://localhost:${PORT}/api/prescriptions`
                );
                console.log("------------------------------------------");
                console.log("PHARMACY & LABORATORY");
                console.log(
                    `Pharmacy:        http://localhost:${PORT}/api/pharmacy/inventory`
                );
                console.log(
                    `Laboratory:      http://localhost:${PORT}/api/laboratory/tests`
                );
                console.log("------------------------------------------");
                console.log("HOSPITAL OPERATIONS");
                console.log(
                    `Billing:         http://localhost:${PORT}/api/billing`
                );
                console.log(
                    `Admissions:      http://localhost:${PORT}/api/admissions`
                );
                console.log(
                    `Beds:             http://localhost:${PORT}/api/beds`
                );
                console.log(
                    `Discharges:      http://localhost:${PORT}/api/discharges`
                );
                console.log("------------------------------------------");
                console.log("ADMINISTRATION");
                console.log(
                    `Roles:            http://localhost:${PORT}/api/roles`
                );
                console.log(
                    `Notifications:   http://localhost:${PORT}/api/notifications`
                );
                console.log(
                    `Analytics:        http://localhost:${PORT}/api/analytics`
                );
                console.log(
                    `Reports:          http://localhost:${PORT}/api/reports`
                );
                console.log(
                    `Audit Logs:       http://localhost:${PORT}/api/audit-logs`
                );
                console.log(
                    `Global Search:    http://localhost:${PORT}/api/search`
                );
                console.log("==========================================");
                console.log("");
            }
        );

    } catch (error) {
        console.error("");
        console.error(
            "Failed to start MediCore server:",
            error.message
        );
        console.error("");

        process.exit(1);
    }
};

// ============================================================
// APPLICATION START
// ============================================================

startServer();