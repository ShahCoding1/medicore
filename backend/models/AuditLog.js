const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        module: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        action: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        targetType: {
            type: String,
            trim: true,
            maxlength: 100
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId
        },

        target: {
            type: String,
            trim: true,
            maxlength: 300
        },

        status: {
            type: String,
            enum: ["success", "failed", "warning"],
            default: "success"
        },

        ipAddress: {
            type: String,
            trim: true,
            maxlength: 100
        },

        userAgent: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        previousState: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        newState: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);