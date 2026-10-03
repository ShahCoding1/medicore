const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

const getNotifications = async (req, res) => {
    try {
        const {
            category = "",
            read = "",
            page = 1,
            limit = 25
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const pageLimit = Math.min(
            Math.max(Number(limit) || 25, 1),
            100
        );

        const query = {
            recipient: req.user.id
        };

        if (category) {
            query.category = category;
        }

        if (read === "unread") {
            query.isRead = false;
        }

        if (read === "read") {
            query.isRead = true;
        }

        const skip =
            (currentPage - 1) * pageLimit;

        const [notifications, total] =
            await Promise.all([
                Notification.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(pageLimit)
                    .lean(),

                Notification.countDocuments(query)
            ]);

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user.id,
                isRead: false
            });

        return res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                total,
                page: currentPage,
                limit: pageLimit,
                pages: Math.ceil(
                    total / pageLimit
                )
            }
        });
    } catch (error) {
        console.error(
            "Get notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load notifications."
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const count =
            await Notification.countDocuments({
                recipient: req.user.id,
                isRead: false
            });

        return res.status(200).json({
            success: true,
            data: {
                unreadCount: count
            }
        });
    } catch (error) {
        console.error(
            "Get unread count error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load notification count."
        });
    }
};

const getNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const notification =
            await Notification.findOne({
                _id: id,
                recipient: req.user.id
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error(
            "Get notification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load notification."
        });
    }
};

const createNotification = async (req, res) => {
    try {
        const {
            recipient,
            title,
            message,
            category,
            type,
            entityType,
            entityId,
            actionUrl,
            channels
        } = req.body;

        const notificationRecipient =
            recipient || req.user.id;

        if (
            !isValidObjectId(
                notificationRecipient
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid recipient ID."
            });
        }

        if (!title || !String(title).trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Notification title is required."
            });
        }

        if (
            !message ||
            !String(message).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Notification message is required."
            });
        }

        const validCategories = [
            "appointment",
            "lab",
            "pharmacy",
            "billing",
            "system"
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid notification category."
            });
        }

        const notification =
            await Notification.create({
                recipient:
                    notificationRecipient,

                title: String(title).trim(),

                message:
                    String(message).trim(),

                category,

                type: type || "info",

                entityType:
                    entityType?.trim() || undefined,

                entityId:
                    entityId &&
                    isValidObjectId(entityId)
                        ? entityId
                        : undefined,

                actionUrl:
                    actionUrl?.trim() || undefined,

                channels: {
                    inApp:
                        channels?.inApp !== false,

                    email:
                        channels?.email === true,

                    sms:
                        channels?.sms === true,

                    push:
                        channels?.push === true
                }
            });

        return res.status(201).json({
            success: true,
            message:
                "Notification created successfully.",
            data: notification
        });
    } catch (error) {
        console.error(
            "Create notification error:",
            error
        );

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message: Object.values(
                    error.errors
                )
                    .map(
                        (item) =>
                            item.message
                    )
                    .join(" ")
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to create notification."
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid notification ID."
            });
        }

        const notification =
            await Notification.findOneAndUpdate(
                {
                    _id: id,
                    recipient: req.user.id
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date()
                    }
                },
                {
                    new: true
                }
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Notification marked as read.",
            data: notification
        });
    } catch (error) {
        console.error(
            "Mark notification read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update notification."
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const result =
            await Notification.updateMany(
                {
                    recipient: req.user.id,
                    isRead: false
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date()
                    }
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "All notifications marked as read.",
            data: {
                modifiedCount:
                    result.modifiedCount
            }
        });
    } catch (error) {
        console.error(
            "Mark all notifications read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update notifications."
        });
    }
};

const deleteNotification = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid notification ID."
            });
        }

        const notification =
            await Notification.findOneAndDelete({
                _id: id,
                recipient: req.user.id
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message:
                    "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Notification deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete notification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete notification."
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    getNotification,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
};