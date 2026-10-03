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

router.use(protect);

/*
 * Keep summary before /:id
 * so "summary" is not treated as an admission ID.
 */
router.get("/summary", getAdmissionSummary);

router.get("/", getAdmissions);

router.post("/", createAdmission);

router.get("/:id", getAdmission);

router.put("/:id", updateAdmission);

router.delete("/:id", deleteAdmission);

module.exports = router;