const settingsData = {
    profile: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        language: "en",
        timezone: "Asia/Karachi"
    },

    general: {
        dateFormat: "DD/MM/YYYY",
        workingHours: "09:00 - 17:00"
    },

    hospital: {
        name: "",
        type: "General Hospital",
        registrationNumber: "",
        phone: "",
        address: ""
    },

    notifications: {
        inApp: true,
        email: false,
        sms: false,
        push: false,
        appointments: true,
        lab: true,
        billing: true,
        inventory: true,
        security: true
    },

    appearance: {
        theme: "light"
    },

    billing: {
        currency: "PKR",
        invoicePrefix: "INV-"
    }
};

const settingsAPI = {
    async loadProfile() {
        try {
            const response =
                await window.mediCoreAPI.get("/auth/me");

            return response.data.data || response.data.user;
        } catch (error) {
            console.warn("Profile API unavailable.");
            return null;
        }
    },

    async saveProfile(payload) {
        return window.mediCoreAPI.put(
            "/auth/profile",
            payload
        );
    },

    async saveHospital(payload) {
        return window.mediCoreAPI.put(
            "/hospital",
            payload
        );
    },

    async savePreferences(payload) {
        return window.mediCoreAPI.put(
            "/preferences",
            payload
        );
    },

    async changePassword(payload) {
        return window.mediCoreAPI.put(
            "/auth/change-password",
            payload
        );
    }
};