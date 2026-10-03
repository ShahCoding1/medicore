const mongoose = require("mongoose");

const dischargeSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        admission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admission",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        },

        admissionDate: {
            type: Date,
            required: true
        },

        dischargeDate: {
            type: Date,
            required: true
        },

        diagnosis: {
            type: String,
            trim: true,
            maxlength: 3000
        },

        treatment: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        procedures: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        medication: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        condition: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        followUp: {
            type: String,
            trim: true,
            maxlength: 3000
        },

        instructions: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        dischargeSummary: {
            type: String,
            trim: true,
            maxlength: 10000
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

dischargeSchema.index({ patient: 1 });
dischargeSchema.index({ admission: 1 });
dischargeSchema.index({ doctor: 1 });
dischargeSchema.index({ dischargeDate: -1 });
dischargeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Discharge", dischargeSchema);