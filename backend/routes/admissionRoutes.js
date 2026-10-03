const express = require("express");

const {
    getAdmissions,
    getAdmission,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionSummary
} = require("../controllers/admissionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all admissions routes
router.use(protect);

// --------------------------------------------------------------------------
// Admission Summary
// IMPORTANT: Keep this BEFORE /:id
// --------------------------------------------------------------------------

router.get("/summary", getAdmissionSummary);

// --------------------------------------------------------------------------
// Admissions CRUD
// --------------------------------------------------------------------------

router.get("/", getAdmissions);

router.post("/", createAdmission);

router.get("/:id", getAdmission);

router.put("/:id", updateAdmission);

router.delete("/:id", deleteAdmission);

module.exports = router;