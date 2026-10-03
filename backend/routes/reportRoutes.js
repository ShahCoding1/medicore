const express = require("express");

const {
    getReports,
    getReport,
    createReport,
    updateReportStatus,
    deleteReport
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getReports);
router.post("/", createReport);
router.get("/:id", getReport);
router.patch("/:id/status", updateReportStatus);
router.delete("/:id", deleteReport);

module.exports = router;