const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
    {
        admissionNumber: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },

        attendingDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor"
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },

        admissionDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        expectedDischargeDate: {
            type: Date
        },

        actualDischargeDate: {
            type: Date
        },

        admissionType: {
            type: String,
            enum: ["emergency", "routine", "referral", "transfer"],
            default: "routine",
            index: true
        },

        priority: {
            type: String,
            enum: ["low", "normal", "high", "critical"],
            default: "normal",
            index: true
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

        reason: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        diagnosis: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        symptoms: {
            type: String,
            trim: true,
            maxlength: 3000
        },

        ward: {
            type: String,
            trim: true,
            maxlength: 200
        },

        roomNumber: {
            type: String,
            trim: true,
            maxlength: 100
        },

        bedNumber: {
            type: String,
            trim: true,
            maxlength: 100
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        dischargeSummary: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

admissionSchema.pre("validate", async function (next) {
    if (!this.admissionNumber) {
        const datePart = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");

        const randomPart = Math.floor(1000 + Math.random() * 9000);

        this.admissionNumber = `ADM-${datePart}-${randomPart}`;
    }

    next();
});

admissionSchema.index({ admissionDate: -1 });
admissionSchema.index({ patient: 1, status: 1 });
admissionSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model("Admission", admissionSchema);