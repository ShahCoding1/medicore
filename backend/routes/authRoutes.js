const express = require("express");

const {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
} = require("../controllers/authController");

const router = express.Router();

// Registration
router.post("/register", register);

// Login
router.post("/login", login);

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Email verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;