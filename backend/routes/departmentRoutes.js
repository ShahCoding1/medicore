const express = require("express");

const {
    createDepartments
} = require("../controllers/departmentController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/onboarding",
    protect,
    createDepartments
);

module.exports = router;