const express = require("express");

const {
    getDischarges,
    getDischarge,
    createDischarge,
    updateDischarge,
    deleteDischarge,
    getDischargeSummary
} = require("../controllers/dischargeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Summary must come before /:id
router.get("/summary", getDischargeSummary);

// CRUD
router.get("/", getDischarges);
router.post("/", createDischarge);

router.get("/:id", getDischarge);
router.put("/:id", updateDischarge);
router.delete("/:id", deleteDischarge);

module.exports = router;