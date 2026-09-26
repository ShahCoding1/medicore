const express = require("express");

const {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDoctors);

router.get("/:id", protect, getDoctorById);

router.post("/", protect, createDoctor);

router.put("/:id", protect, updateDoctor);

router.delete("/:id", protect, deleteDoctor);

module.exports = router;