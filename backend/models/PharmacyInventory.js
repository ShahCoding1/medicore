/* =========================================================
   MEDICORE — PHARMACY INVENTORY MODEL
   Phase 12 — Pharmacy Inventory
   ========================================================= */

const mongoose = require("mongoose");


/* =========================================================
   PHARMACY INVENTORY SCHEMA
   ========================================================= */

const pharmacyInventorySchema = new mongoose.Schema(
    {
        medicineName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150
        },

        genericName: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        brandName: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        dosageForm: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        strength: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        batchNumber: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        expiryDate: {
            type: Date,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        reorderLevel: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        unit: {
            type: String,
            trim: true,
            maxlength: 50,
            default: "units"
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "discontinued",
                "out_of_stock"
            ],
            default: "active"
        },

        purchasePrice: {
            type: Number,
            min: 0,
            default: 0
        },

        sellingPrice: {
            type: Number,
            min: 0,
            default: 0
        },

        supplier: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        supplierContact: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);


/* =========================================================
   INDEXES
   ========================================================= */

pharmacyInventorySchema.index({
    medicineName: 1
});

pharmacyInventorySchema.index({
    genericName: 1
});

pharmacyInventorySchema.index({
    category: 1
});

pharmacyInventorySchema.index({
    batchNumber: 1
});

pharmacyInventorySchema.index({
    expiryDate: 1
});

pharmacyInventorySchema.index({
    status: 1
});


/* =========================================================
   VIRTUAL — LOW STOCK
   ========================================================= */

pharmacyInventorySchema.virtual(
    "isLowStock"
).get(function () {
    return (
        this.quantity <=
        this.reorderLevel
    );
});


/* =========================================================
   VIRTUAL — EXPIRED
   ========================================================= */

pharmacyInventorySchema.virtual(
    "isExpired"
).get(function () {

    if (!this.expiryDate) {
        return false;
    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return (
        this.expiryDate < today
    );
});


/* =========================================================
   VIRTUAL — EXPIRING SOON
   ========================================================= */

pharmacyInventorySchema.virtual(
    "isExpiringSoon"
).get(function () {

    if (!this.expiryDate) {
        return false;
    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const limit =
        new Date(today);

    limit.setDate(
        limit.getDate() + 90
    );

    return (
        this.expiryDate >= today &&
        this.expiryDate <= limit
    );
});


/* =========================================================
   JSON VIRTUALS
   ========================================================= */

pharmacyInventorySchema.set(
    "toJSON",
    {
        virtuals: true
    }
);


/* =========================================================
   EXPORT
   ========================================================= */

module.exports =
    mongoose.model(
        "PharmacyInventory",
        pharmacyInventorySchema
    );