const express = require("express");

const {
    getNotifications,
    getUnreadCount,
    getNotification,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
    "/unread-count",
    getUnreadCount
);

router.get(
    "/",
    getNotifications
);

router.post(
    "/",
    createNotification
);

router.get(
    "/:id",
    getNotification
);

router.patch(
    "/:id/read",
    markAsRead
);

router.patch(
    "/read-all",
    markAllAsRead
);

router.delete(
    "/:id",
    deleteNotification
);

module.exports = router;