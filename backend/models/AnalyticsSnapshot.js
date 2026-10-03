const mongoose = require("mongoose");

const analyticsSnapshotSchema = new mongoose.Schema(
    {
        metric: { type: String, required: true, trim: true },
        value: { type: Number, default: 0 },
        period: { type: String, trim: true },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },
        metadata: { type: mongoose.Schema.Types.Mixed }
    },
    { timestamps: true }
);

analyticsSnapshotSchema.index({ metric: 1, createdAt: -1 });

module.exports = mongoose.model(
    "AnalyticsSnapshot",
    analyticsSnapshotSchema
);