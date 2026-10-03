const notificationUI = {

    categoryIcon(category) {
        const icons = {
            appointment: "◷",
            lab: "⌬",
            pharmacy: "Rx",
            billing: "₨",
            system: "⚙"
        };

        return icons[category] || "●";
    },

    timeAgo(date) {
        const diff =
            Date.now() -
            new Date(date).getTime();

        const minutes =
            Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60)
            return `${minutes} min ago`;

        const hours =
            Math.floor(minutes / 60);

        if (hours < 24)
            return `${hours} hr ago`;

        const days =
            Math.floor(hours / 24);

        if (days < 7)
            return `${days} day${days > 1 ? "s" : ""} ago`;

        return new Date(date).toLocaleDateString();
    },

    render(notifications) {

        const list =
            document.getElementById(
                "notificationList"
            );

        const empty =
            document.getElementById(
                "notificationEmpty"
            );

        if (!notifications.length) {
            list.innerHTML = "";
            empty.classList.remove("d-none");
            return;
        }

        empty.classList.add("d-none");

        list.innerHTML =
            notifications.map(item => `
                <article
                    class="notification-item ${item.isRead ? "" : "unread"}"
                    data-id="${item._id}">

                    <div class="notification-icon">
                        ${this.categoryIcon(item.category)}
                    </div>

                    <div class="notification-content">

                        <div class="notification-title-row">

                            <h3 class="notification-title">
                                ${this.escape(item.title)}
                            </h3>

                            ${
                                !item.isRead
                                    ? `<span class="notification-unread-dot"></span>`
                                    : ""
                            }

                        </div>

                        <p class="notification-message">
                            ${this.escape(item.message)}
                        </p>

                        <span class="notification-time">
                            ${this.timeAgo(item.createdAt)}
                        </span>

                    </div>

                    <div class="notification-actions">

                        ${
                            !item.isRead
                                ? `
                                <button
                                    class="notification-action-btn"
                                    data-action="read"
                                    data-id="${item._id}"
                                    title="Mark as read">
                                    ✓
                                </button>
                                `
                                : ""
                        }

                        <button
                            class="notification-action-btn"
                            data-action="delete"
                            data-id="${item._id}"
                            title="Delete">
                            ×
                        </button>

                    </div>

                </article>
            `).join("");
    },

    updateSummary() {

        const notifications =
            notificationData.notifications;

        const unread =
            notifications.filter(
                item => !item.isRead
            ).length;

        const today =
            notifications.filter(item => {
                const date =
                    new Date(item.createdAt);

                const now = new Date();

                return (
                    date.toDateString() ===
                    now.toDateString()
                );
            }).length;

        document.getElementById(
            "totalCount"
        ).textContent = notifications.length;

        document.getElementById(
            "unreadCount"
        ).textContent =
            notificationData.unreadCount ||
            unread;

        document.getElementById(
            "todayCount"
        ).textContent = today;

        const badge =
            document.getElementById(
                "sidebarUnreadBadge"
            );

        badge.textContent =
            notificationData.unreadCount;

        badge.style.display =
            notificationData.unreadCount
                ? "inline-flex"
                : "none";

        const dot =
            document.getElementById(
                "headerNotificationDot"
            );

        dot.style.display =
            notificationData.unreadCount
                ? "block"
                : "none";
    },

    setLoading(show) {
        document
            .getElementById("notificationLoading")
            .classList.toggle(
                "d-none",
                !show
            );
    },

    escape(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    toast(message) {
        if (
            typeof window.showToast ===
            "function"
        ) {
            window.showToast(message);
            return;
        }

        alert(message);
    }
};

window.notificationUI = notificationUI;