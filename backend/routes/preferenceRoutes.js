const express = require("express");

const {
    savePreferences
} = require("../controllers/preferenceController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/onboarding",
    protect,
    savePreferences
);

module.exports = router;