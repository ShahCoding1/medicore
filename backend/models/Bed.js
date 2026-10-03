const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
    {
        bedNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        ward: {
            type: String,
            required: true,
            trim: true
        },

        roomNumber: {
            type: String,
            trim: true
        },

        bedType: {
            type: String,
            enum: [
                "general",
                "semi_private",
                "private",
                "icu",
                "emergency",
                "isolation"
            ],
            default: "general"
        },

        status: {
            type: String,
            enum: [
                "available",
                "occupied",
                "reserved",
                "maintenance",
                "blocked"
            ],
            default: "available"
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            default: null
        },

        admission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admission",
            default: null
        },

        floor: {
            type: String,
            trim: true
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 1000
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

bedSchema.index({ bedNumber: 1 }, { unique: true });
bedSchema.index({ ward: 1 });
bedSchema.index({ status: 1 });
bedSchema.index({ patient: 1 });

module.exports = mongoose.model("Bed", bedSchema);