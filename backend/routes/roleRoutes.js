const express = require("express");

const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getRoleSummary
} = require("../controllers/roleController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getRoleSummary);

router.get("/", getRoles);
router.post("/", createRole);

router.get("/:id", getRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

module.exports = router;