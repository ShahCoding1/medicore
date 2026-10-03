document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const tabs =
            document.querySelectorAll(
                ".notification-tab"
            );

        const refresh =
            document.getElementById(
                "refreshNotifications"
            );

        const markAll =
            document.getElementById(
                "markAllReadButton"
            );

        async function refreshNotifications() {

            notificationUI.setLoading(true);

            try {
                await notificationDataAPI
                    .loadNotifications();

                notificationUI.render(
                    notificationData.notifications
                );

                notificationUI.updateSummary();

            } catch (error) {

                console.error(
                    "Notification loading failed:",
                    error
                );

                notificationUI.toast(
                    "Unable to load notifications."
                );

            } finally {
                notificationUI.setLoading(false);
            }
        }

        tabs.forEach(tab => {

            tab.addEventListener(
                "click",
                async () => {

                    tabs.forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                    tab.classList.add(
                        "active"
                    );

                    notificationData.filter =
                        tab.dataset.filter;

                    await refreshNotifications();
                }
            );

        });

        refresh.addEventListener(
            "click",
            refreshNotifications
        );

        markAll.addEventListener(
            "click",
            async () => {

                if (
                    !notificationData.unreadCount
                ) {
                    notificationUI.toast(
                        "There are no unread notifications."
                    );
                    return;
                }

                try {

                    await notificationDataAPI
                        .markAllNotificationsRead();

                    await loadUnreadCountSafe();

                    await refreshNotifications();

                    notificationUI.toast(
                        "All notifications marked as read."
                    );

                } catch (error) {

                    console.error(error);

                    notificationUI.toast(
                        "Unable to update notifications."
                    );
                }
            }
        );

        document
            .getElementById("notificationList")
            .addEventListener(
                "click",
                async event => {

                    const button =
                        event.target.closest(
                            "[data-action]"
                        );

                    if (!button) return;

                    event.stopPropagation();

                    const id =
                        button.dataset.id;

                    const action =
                        button.dataset.action;

                    try {

                        if (action === "read") {

                            await notificationDataAPI
                                .markNotificationRead(
                                    id
                                );

                            await loadUnreadCountSafe();

                            await refreshNotifications();
                        }

                        if (action === "delete") {

                            if (
                                !confirm(
                                    "Delete this notification?"
                                )
                            ) {
                                return;
                            }

                            await notificationDataAPI
                                .deleteNotification(
                                    id
                                );

                            await loadUnreadCountSafe();

                            await refreshNotifications();
                        }

                    } catch (error) {

                        console.error(error);

                        notificationUI.toast(
                            "Unable to update notification."
                        );
                    }
                }
            );

        document
            .getElementById("notificationList")
            .addEventListener(
                "click",
                async event => {

                    if (
                        event.target.closest(
                            "[data-action]"
                        )
                    ) {
                        return;
                    }

                    const item =
                        event.target.closest(
                            ".notification-item"
                        );

                    if (!item) return;

                    const id = item.dataset.id;

                    const notification =
                        notificationData
                            .notifications
                            .find(
                                item =>
                                    item._id === id
                            );

                    if (
                        notification &&
                        !notification.isRead
                    ) {
                        try {
                            await notificationDataAPI
                                .markNotificationRead(
                                    id
                                );

                            await loadUnreadCountSafe();

                            await refreshNotifications();

                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            );

        async function loadUnreadCountSafe() {
            try {
                await notificationDataAPI
                    .loadUnreadCount();

                notificationUI.updateSummary();
            } catch (error) {
                console.error(error);
            }
        }

        await loadUnreadCountSafe();
        await refreshNotifications();
    }
);