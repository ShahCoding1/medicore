const express = require("express");

const {
    createOrUpdateHospital
} = require("../controllers/hospitalController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/onboarding",
    protect,
    createOrUpdateHospital
);

module.exports = router;