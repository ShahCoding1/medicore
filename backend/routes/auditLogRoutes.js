const express = require("express");

const {
    getAuditLogs,
    getAuditLog,
    createAuditLog,
    getAuditSummary
} = require("../controllers/auditLogController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getAuditSummary);
router.get("/", getAuditLogs);
router.post("/", createAuditLog);
router.get("/:id", getAuditLog);

module.exports = router;