const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
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

        invoiceNumber: {
            type: String,
            required: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "card",
                "insurance",
                "online"
            ],
            default: "cash"
        },

        status: {
            type: String,
            enum: [
                "pending",
                "paid",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

invoiceSchema.index(
    { hospital: 1, invoiceNumber: 1 },
    { unique: true }
);

module.exports =
    mongoose.model("Invoice", invoiceSchema);