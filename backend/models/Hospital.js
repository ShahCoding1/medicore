const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        type: {
            type: String,
            required: true,
            enum: [
                "general",
                "specialized",
                "teaching",
                "clinic",
                "medical_center",
                "other"
            ]
        },

        registrationNumber: {
            type: String,
            trim: true,
            default: ""
        },

        country: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        onboardingCompleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Hospital",
    hospitalSchema
);