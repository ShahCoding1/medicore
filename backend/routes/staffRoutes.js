const express = require("express");

const {
    getStaff,
    getStaffMember,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffSummary
} = require("../controllers/staffController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Summary
router.get("/summary", getStaffSummary);

// Staff CRUD
router.get("/", getStaff);
router.post("/", createStaff);

router.get("/:id", getStaffMember);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;