document.addEventListener(
    "DOMContentLoaded",
    async () => {

        document
            .querySelectorAll(".settings-nav-item")
            .forEach((item) => {
                item.addEventListener(
                    "click",
                    () => {
                        settingsUI.showSection(
                            item.dataset.section
                        );
                    }
                );
            });

        // Profile
        try {
            const profile =
                await settingsAPI.loadProfile();

            settingsUI.fillProfile(profile);
        } catch (error) {
            console.warn(
                "Could not load profile:",
                error
            );
        }

        document
            .getElementById("profileForm")
            .addEventListener(
                "submit",
                async (event) => {
                    event.preventDefault();

                    const payload =
                        settingsUI.collectProfile();

                    if (
                        !payload.firstName ||
                        !payload.lastName ||
                        !payload.email
                    ) {
                        settingsUI.showMessage(
                            "First name, last name and email are required.",
                            "danger"
                        );

                        return;
                    }

                    try {
                        await settingsAPI.saveProfile(
                            payload
                        );

                        settingsUI.showMessage(
                            "Profile updated successfully."
                        );

                        document.getElementById(
                            "profileNamePreview"
                        ).textContent =
                            `${payload.firstName} ${payload.lastName}`;
                    } catch (error) {
                        settingsUI.showMessage(
                            error.response?.data?.message ||
                            "Profile API is not available yet.",
                            "warning"
                        );
                    }
                }
            );

        // General
        document
            .getElementById("saveGeneral")
            .addEventListener(
                "click",
                () => {
                    settingsData.general.dateFormat =
                        document.getElementById(
                            "dateFormat"
                        ).value;

                    settingsData.general.workingHours =
                        document.getElementById(
                            "workingHours"
                        ).value;

                    settingsUI.showMessage(
                        "General settings saved."
                    );
                }
            );

        // Hospital
        document
            .getElementById("saveHospital")
            .addEventListener(
                "click",
                async () => {

                    const payload = {
                        name:
                            document.getElementById(
                                "hospitalName"
                            ).value.trim(),

                        type:
                            document.getElementById(
                                "hospitalType"
                            ).value,

                        registrationNumber:
                            document.getElementById(
                                "registrationNumber"
                            ).value.trim(),

                        phone:
                            document.getElementById(
                                "hospitalPhone"
                            ).value.trim(),

                        address:
                            document.getElementById(
                                "hospitalAddress"
                            ).value.trim()
                    };

                    try {
                        await settingsAPI.saveHospital(
                            payload
                        );

                        settingsUI.showMessage(
                            "Hospital settings saved."
                        );
                    } catch (error) {
                        settingsUI.showMessage(
                            error.response?.data?.message ||
                            "Hospital settings API is not available yet.",
                            "warning"
                        );
                    }
                }
            );

        // Notifications
        document
            .getElementById("saveNotifications")
            .addEventListener(
                "click",
                async () => {

                    const payload =
                        settingsUI.collectNotifications();

                    settingsData.notifications =
                        payload;

                    try {
                        await settingsAPI.savePreferences(
                            payload
                        );

                        settingsUI.showMessage(
                            "Notification preferences saved."
                        );
                    } catch (error) {
                        settingsUI.showMessage(
                            "Notification preferences saved locally.",
                            "warning"
                        );
                    }
                }
            );

        // Password
        document
            .getElementById("changePassword")
            .addEventListener(
                "click",
                async () => {

                    const current =
                        document.getElementById(
                            "currentPassword"
                        ).value;

                    const password =
                        document.getElementById(
                            "newPassword"
                        ).value;

                    const confirm =
                        document.getElementById(
                            "confirmPassword"
                        ).value;

                    if (!current || !password || !confirm) {
                        settingsUI.showMessage(
                            "Please complete all password fields.",
                            "danger"
                        );

                        return;
                    }

                    if (password !== confirm) {
                        settingsUI.showMessage(
                            "New passwords do not match.",
                            "danger"
                        );

                        return;
                    }

                    if (password.length < 8) {
                        settingsUI.showMessage(
                            "Password must contain at least 8 characters.",
                            "danger"
                        );

                        return;
                    }

                    try {
                        await settingsAPI.changePassword({
                            currentPassword: current,
                            newPassword: password
                        });

                        settingsUI.showMessage(
                            "Password changed successfully."
                        );

                        document.getElementById(
                            "currentPassword"
                        ).value = "";

                        document.getElementById(
                            "newPassword"
                        ).value = "";

                        document.getElementById(
                            "confirmPassword"
                        ).value = "";
                    } catch (error) {
                        settingsUI.showMessage(
                            error.response?.data?.message ||
                            "Password API is not available yet.",
                            "warning"
                        );
                    }
                }
            );

        // 2FA
        document
            .getElementById("enable2FA")
            .addEventListener(
                "click",
                () => {
                    settingsUI.showMessage(
                        "Two-factor authentication setup will be connected during the security integration phase.",
                        "warning"
                    );
                }
            );

        // Appearance
        document
            .getElementById("saveAppearance")
            .addEventListener(
                "click",
                () => {
                    const theme =
                        document.getElementById(
                            "theme"
                        ).value;

                    localStorage.setItem(
                        "medicore_theme",
                        theme
                    );

                    settingsData.appearance.theme =
                        theme;

                    settingsUI.showMessage(
                        "Appearance settings saved."
                    );
                }
            );

        // Billing
        document
            .getElementById("saveBilling")
            .addEventListener(
                "click",
                () => {
                    settingsData.billing.currency =
                        document.getElementById(
                            "currency"
                        ).value;

                    settingsData.billing.invoicePrefix =
                        document.getElementById(
                            "invoicePrefix"
                        ).value;

                    settingsUI.showMessage(
                        "Billing settings saved."
                    );
                }
            );

        // Load saved theme
        const savedTheme =
            localStorage.getItem(
                "medicore_theme"
            );

        if (savedTheme) {
            document.getElementById(
                "theme"
            ).value = savedTheme;
        }
    }
);