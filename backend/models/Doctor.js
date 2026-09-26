const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        doctorId: {
            type: String,
            required: true,
            trim: true
        },

        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        specialization: {
            type: String,
            required: true,
            trim: true
        },

        licenseNumber: {
            type: String,
            trim: true,
            default: ""
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other"
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

doctorSchema.index(
    { hospital: 1, doctorId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);