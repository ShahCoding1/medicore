const express = require("express");

const {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
} = require("../controllers/medicalRecordController");

const {
    protect
} = require("../middleware/authMiddleware");

const router =
    express.Router();


// ============================================================
// MEDICAL RECORD ROUTES
// ============================================================

// Get all medical records
router.get(
    "/",
    protect,
    getMedicalRecords
);


// Get single medical record
router.get(
    "/:id",
    protect,
    getMedicalRecordById
);


// Create medical record
router.post(
    "/",
    protect,
    createMedicalRecord
);


// Update medical record
router.put(
    "/:id",
    protect,
    updateMedicalRecord
);


// Delete medical record
router.delete(
    "/:id",
    protect,
    deleteMedicalRecord
);


module.exports = router;