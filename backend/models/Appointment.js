const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "scheduled",
                "completed",
                "cancelled",
                "no_show"
            ],
            default: "scheduled"
        }
    },
    {
        timestamps: true
    }
);

// ==========================================
// INDEXES
// ==========================================

appointmentSchema.index({
    hospital: 1,
    appointmentDate: 1
});

appointmentSchema.index({
    hospital: 1,
    patient: 1
});

appointmentSchema.index({
    hospital: 1,
    doctor: 1
});

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);