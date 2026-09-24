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
            ref: "User",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            trim: true,
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

appointmentSchema.index({
    hospital: 1,
    appointmentDate: 1
});

module.exports =
    mongoose.model("Appointment", appointmentSchema);