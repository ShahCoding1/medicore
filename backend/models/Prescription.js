const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        dosage: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        frequency: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        duration: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        instructions: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    {
        _id: true
    }
);

const prescriptionSchema = new mongoose.Schema(
    {
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

        diagnosis: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        prescriptionDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        medicines: {
            type: [medicineSchema],
            required: true,
            validate: {
                validator: (value) =>
                    Array.isArray(value) && value.length > 0,
                message: "At least one medicine is required."
            }
        },

        instructions: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        refills: {
            type: Number,
            min: 0,
            max: 20,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "active",
                "completed",
                "cancelled"
            ],
            default: "active"
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

prescriptionSchema.index({
    patient: 1,
    prescriptionDate: -1
});

prescriptionSchema.index({
    doctor: 1,
    prescriptionDate: -1
});

prescriptionSchema.index({
    status: 1
});

prescriptionSchema.index({
    prescriptionDate: -1
});

module.exports = mongoose.model(
    "Prescription",
    prescriptionSchema
);