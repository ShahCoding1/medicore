const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
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

        recordDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        chiefComplaint: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        symptoms: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        diagnosis: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        treatmentPlan: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);


// ============================================================
// INDEXES
// ============================================================

medicalRecordSchema.index({
    hospital: 1,
    patient: 1,
    recordDate: -1
});

medicalRecordSchema.index({
    hospital: 1,
    doctor: 1,
    recordDate: -1
});

medicalRecordSchema.index({
    hospital: 1,
    recordDate: -1
});


module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);