const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        role: {
            type: String,
            enum: [
                "admin",
                "doctor",
                "receptionist",
                "pharmacist",
                "lab_technician"
            ],
            default: "receptionist"
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // Email verification
        isEmailVerified: {
            type: Boolean,
            default: false
        },

        emailVerificationToken: {
            type: String,
            default: null
        },

        emailVerificationExpires: {
            type: Date,
            default: null
        },

        // Password reset
        passwordResetToken: {
            type: String,
            default: null
        },

        passwordResetExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);