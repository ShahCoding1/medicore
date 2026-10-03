const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        category: {
            type: String,
            required: true,
            enum: [
                "patient",
                "clinical",
                "financial",
                "pharmacy",
                "laboratory",
                "appointment",
                "doctor",
                "department",
                "operations",
                "audit"
            ]
        },

        reportType: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        dateRange: {
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date,
                required: true
            }
        },

        filters: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        columns: {
            type: [String],
            default: []
        },

        grouping: {
            type: String,
            trim: true,
            maxlength: 100
        },

        sort: {
            field: {
                type: String,
                trim: true,
                maxlength: 100
            },
            direction: {
                type: String,
                enum: ["asc", "desc"],
                default: "asc"
            }
        },

        status: {
            type: String,
            enum: ["generating", "ready", "failed", "expired"],
            default: "generating"
        },

        generatedAt: {
            type: Date
        },

        expiresAt: {
            type: Date
        },

        errorMessage: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        result: {
            type: mongoose.Schema.Types.Mixed,
            default: null
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

reportSchema.index({ category: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ createdBy: 1, createdAt: -1 });
reportSchema.index({ reportType: 1 });

reportSchema.pre("validate", function (next) {
    if (
        this.dateRange?.from &&
        this.dateRange?.to &&
        this.dateRange.from > this.dateRange.to
    ) {
        return next(
            new Error("Report start date cannot be after the end date.")
        );
    }

    next();
});

module.exports = mongoose.model("Report", reportSchema);