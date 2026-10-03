const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        category: {
            type: String,
            enum: [
                "appointment",
                "lab",
                "pharmacy",
                "billing",
                "system"
            ],
            required: true
        },

        type: {
            type: String,
            enum: [
                "info",
                "success",
                "warning",
                "error"
            ],
            default: "info"
        },

        entityType: {
            type: String,
            trim: true,
            maxlength: 100
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId
        },

        actionUrl: {
            type: String,
            trim: true,
            maxlength: 500
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date
        },

        channels: {
            inApp: {
                type: Boolean,
                default: true
            },

            email: {
                type: Boolean,
                default: false
            },

            sms: {
                type: Boolean,
                default: false
            },

            push: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1
});

notificationSchema.index({
    recipient: 1,
    category: 1,
    createdAt: -1
});

notificationSchema.index({
    createdAt: -1
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);