const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            unique: true
        },

        currency: {
            type: String,
            required: true,
            default: "PKR"
        },

        timezone: {
            type: String,
            required: true,
            default: "Asia/Karachi"
        },

        dateFormat: {
            type: String,
            required: true,
            default: "DD/MM/YYYY"
        },

        workingHoursStart: {
            type: String,
            required: true,
            default: "09:00"
        },

        workingHoursEnd: {
            type: String,
            required: true,
            default: "17:00"
        },

        appointmentDuration: {
            type: Number,
            required: true,
            default: 30,
            enum: [15, 20, 30, 45, 60]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Preference",
    preferenceSchema
);