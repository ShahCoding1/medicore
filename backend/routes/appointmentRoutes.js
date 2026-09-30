const express = require("express");

const {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require("../controllers/appointmentController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// APPOINTMENT ROUTES
// ==========================================

router.get(
    "/",
    protect,
    getAppointments
);

router.get(
    "/:id",
    protect,
    getAppointmentById
);

router.post(
    "/",
    protect,
    createAppointment
);

router.put(
    "/:id",
    protect,
    updateAppointment
);

router.delete(
    "/:id",
    protect,
    deleteAppointment
);

module.exports = router;