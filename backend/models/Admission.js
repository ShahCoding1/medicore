const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
    {
        admissionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },

        attendingDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null,
            index: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
            index: true
        },

        admissionDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },

        expectedDischargeDate: {
            type: Date,
            default: null
        },

        actualDischargeDate: {
            type: Date,
            default: null
        },

        admissionType: {
            type: String,
            enum: [
                "emergency",
                "routine",
                "referral",
                "transfer"
            ],
            default: "routine",
            required: true
        },

        priority: {
            type: String,
            enum: [
                "low",
                "normal",
                "high",
                "critical"
            ],
            default: "normal"
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        diagnosis: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        symptoms: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        roomNumber: {
            type: String,
            trim: true,
            default: ""
        },

        bedNumber: {
            type: String,
            trim: true,
            default: ""
        },

        ward: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "admitted",
                "observation",
                "discharged",
                "transferred",
                "cancelled"
            ],
            default: "admitted",
            index: true
        },

        dischargeSummary: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

/*
 * Automatically normalize the admission number.
 */
admissionSchema.pre("validate", function (next) {
    if (this.admissionNumber) {
        this.admissionNumber =
            this.admissionNumber.trim().toUpperCase();
    }

    if (this.roomNumber) {
        this.roomNumber =
            this.roomNumber.trim();
    }

    if (this.bedNumber) {
        this.bedNumber =
            this.bedNumber.trim();
    }

    if (this.ward) {
        this.ward =
            this.ward.trim();
    }

    next();
});

/*
 * Useful indexes for admissions management.
 */
admissionSchema.index({
    patient: 1,
    admissionDate: -1
});

admissionSchema.index({
    status: 1,
    admissionDate: -1
});

admissionSchema.index({
    department: 1,
    status: 1
});

admissionSchema.index({
    attendingDoctor: 1,
    status: 1
});

module.exports = mongoose.model(
    "Admission",
    admissionSchema
);