const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        patientId: {
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

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: "other"
        },

        dateOfBirth: {
            type: Date,
            default: null
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
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

patientSchema.index(
    { hospital: 1, patientId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Patient", patientSchema);