const settingsUI = {
    showSection(section) {
        document
            .querySelectorAll(".settings-nav-item")
            .forEach((item) => {
                item.classList.toggle(
                    "active",
                    item.dataset.section === section
                );
            });

        document
            .querySelectorAll(".settings-section")
            .forEach((panel) => {
                panel.classList.toggle(
                    "active",
                    panel.dataset.panel === section
                );
            });
    },

    fillProfile(profile) {
        if (!profile) {
            return;
        }

        const firstName =
            profile.firstName || "";

        const lastName =
            profile.lastName || "";

        document.getElementById(
            "firstName"
        ).value = firstName;

        document.getElementById(
            "lastName"
        ).value = lastName;

        document.getElementById(
            "email"
        ).value = profile.email || "";

        document.getElementById(
            "phone"
        ).value = profile.phone || "";

        document.getElementById(
            "language"
        ).value =
            profile.language || "en";

        document.getElementById(
            "timezone"
        ).value =
            profile.timezone ||
            "Asia/Karachi";

        document.getElementById(
            "profileNamePreview"
        ).textContent =
            `${firstName} ${lastName}`.trim() ||
            "User Profile";
    },

    collectProfile() {
        return {
            firstName:
                document.getElementById(
                    "firstName"
                ).value.trim(),

            lastName:
                document.getElementById(
                    "lastName"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            phone:
                document.getElementById(
                    "phone"
                ).value.trim(),

            language:
                document.getElementById(
                    "language"
                ).value,

            timezone:
                document.getElementById(
                    "timezone"
                ).value
        };
    },

    collectNotifications() {
        return {
            inApp:
                document.getElementById(
                    "notifyInApp"
                ).checked,

            email:
                document.getElementById(
                    "notifyEmail"
                ).checked,

            sms:
                document.getElementById(
                    "notifySms"
                ).checked,

            push:
                document.getElementById(
                    "notifyPush"
                ).checked,

            appointments:
                document.getElementById(
                    "notifyAppointments"
                ).checked,

            lab:
                document.getElementById(
                    "notifyLab"
                ).checked,

            billing:
                document.getElementById(
                    "notifyBilling"
                ).checked,

            inventory:
                document.getElementById(
                    "notifyInventory"
                ).checked,

            security:
                document.getElementById(
                    "notifySecurity"
                ).checked
        };
    },

    showMessage(message, type = "success") {
        const existing =
            document.getElementById(
                "settingsMessage"
            );

        if (existing) {
            existing.remove();
        }

        const alert =
            document.createElement("div");

        alert.id = "settingsMessage";

        alert.className =
            `alert alert-${type} position-fixed top-0 end-0 m-3 shadow`;

        alert.style.zIndex = "9999";

        alert.textContent = message;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
};