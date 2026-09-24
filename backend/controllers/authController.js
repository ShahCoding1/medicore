const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const isStrongPassword = (password) => {
    return (
        password &&
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
};

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone ? phone.trim() : "";

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 100 characters"
            });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters, including uppercase, lowercase, number and special character."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: normalizedPhone,
            role: "receptionist",
            isEmailVerified: false,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpires: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )
        });

        const token = generateToken(user);

        const response = {
            success: true,
            message:
                "User registered successfully. Please verify your email address.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        };

        // Development-only verification token.
        // Production email delivery will replace this.
        if (process.env.NODE_ENV === "development") {
            response.developmentVerificationToken =
                verificationToken;
        }

        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email or password is incorrect."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Email or password is incorrect."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is currently inactive."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists for this email, password reset instructions have been sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.passwordResetToken = hashedResetToken;
        user.passwordResetExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await user.save();

        const response = {
            success: true,
            message:
                "If an account exists for this email, password reset instructions have been sent."
        };

        if (process.env.NODE_ENV === "development") {
            response.developmentResetToken = resetToken;
        }

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset token and new password are required"
            });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters, including uppercase, lowercase, number and special character."
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "Password reset token is invalid or has expired."
            });
        }

        user.password = await bcrypt.hash(password, 12);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully."
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// VERIFY EMAIL
// ==========================================

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "Email verification token is invalid or has expired."
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully."
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// RESEND EMAIL VERIFICATION
// ==========================================

const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user || user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message:
                    "If verification is required, a new verification email has been sent."
            });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationToken = hashedVerificationToken;
        user.emailVerificationExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        await user.save();

        const response = {
            success: true,
            message:
                "If verification is required, a new verification email has been sent."
        };

        if (process.env.NODE_ENV === "development") {
            response.developmentVerificationToken =
                verificationToken;
        }

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
};