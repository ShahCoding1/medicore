const notificationData = {
    notifications: [],
    filter: "all",
    unreadCount: 0,
    loading: false
};

async function loadNotifications() {
    notificationData.loading = true;

    try {
        const params = {};

        if (notificationData.filter === "unread") {
            params.read = "unread";
        } else if (
            notificationData.filter !== "all"
        ) {
            params.category =
                notificationData.filter;
        }

        const response =
            await window.mediCoreAPI.get(
                "/notifications",
                { params }
            );

        notificationData.notifications =
            response.data.data || [];

        notificationData.unreadCount =
            response.data.unreadCount || 0;

        return response.data;
    } finally {
        notificationData.loading = false;
    }
}

async function loadUnreadCount() {
    const response =
        await window.mediCoreAPI.get(
            "/notifications/unread-count"
        );

    notificationData.unreadCount =
        response.data.data?.unreadCount || 0;

    return notificationData.unreadCount;
}

async function markNotificationRead(id) {
    return window.mediCoreAPI.patch(
        `/notifications/${id}/read`
    );
}

async function markAllNotificationsRead() {
    return window.mediCoreAPI.patch(
        "/notifications/read-all"
    );
}

async function deleteNotification(id) {
    return window.mediCoreAPI.delete(
        `/notifications/${id}`
    );
}

window.notificationData = notificationData;

window.notificationDataAPI = {
    loadNotifications,
    loadUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
};