const express = require("express");

const {
    createStaff,
    getOnboardingStaffData
} = require("../controllers/staffController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/onboarding",
    protect,
    getOnboardingStaffData
);

router.post(
    "/onboarding",
    protect,
    createStaff
);

module.exports = router;