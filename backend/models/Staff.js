const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        role: {
            type: String,
            required: true,
            enum: [
                "doctor",
                "nurse",
                "receptionist",
                "pharmacist",
                "lab_technician",
                "accountant",
                "hospital_admin"
            ]
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null
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

staffSchema.index({
    hospital: 1,
    email: 1
});

module.exports = mongoose.model("Staff", staffSchema);