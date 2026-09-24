const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        type: {
            type: String,
            required: true,
            enum: [
                "clinical",
                "diagnostic",
                "surgical",
                "emergency",
                "administrative",
                "support",
                "other"
            ]
        },

        head: {
            type: String,
            trim: true,
            default: ""
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

departmentSchema.index(
    { hospital: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "Department",
    departmentSchema
);