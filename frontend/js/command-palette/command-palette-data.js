const commandPaletteData = [
    {
        id: "add-patient",
        title: "Add patient",
        description: "Create a new patient record",
        category: "Patients",
        icon: "+",
        action: () => {
            window.location.href = "patients.html?action=add";
        }
    },
    {
        id: "add-doctor",
        title: "Add doctor",
        description: "Create a new doctor profile",
        category: "Doctors",
        icon: "+",
        action: () => {
            window.location.href = "doctors.html?action=add";
        }
    },
    {
        id: "book-appointment",
        title: "Book appointment",
        description: "Schedule a patient appointment",
        category: "Appointments",
        icon: "+",
        action: () => {
            window.location.href = "appointments.html?action=add";
        }
    },
    {
        id: "create-prescription",
        title: "Create prescription",
        description: "Create a new prescription",
        category: "Clinical",
        icon: "Rx",
        action: () => {
            window.location.href = "prescriptions.html?action=add";
        }
    },
    {
        id: "create-invoice",
        title: "Create invoice",
        description: "Create a new billing invoice",
        category: "Billing",
        icon: "$",
        action: () => {
            window.location.href = "billing.html?action=add";
        }
    },
    {
        id: "order-lab-test",
        title: "Order lab test",
        description: "Create a laboratory test order",
        category: "Laboratory",
        icon: "L",
        action: () => {
            window.location.href = "laboratory-tests.html?action=add";
        }
    },
    {
        id: "generate-report",
        title: "Generate report",
        description: "Create a new report",
        category: "Reports",
        icon: "R",
        action: () => {
            window.location.href = "reports.html?action=add";
        }
    },
    {
        id: "open-analytics",
        title: "Open analytics",
        description: "View hospital analytics",
        category: "Navigation",
        icon: "A",
        action: () => {
            window.location.href = "analytics.html";
        }
    },
    {
        id: "open-settings",
        title: "Open settings",
        description: "Manage MediCore settings",
        category: "Navigation",
        icon: "S",
        action: () => {
            window.location.href = "settings.html";
        }
    },
    {
        id: "logout",
        title: "Logout",
        description: "Sign out of MediCore",
        category: "Account",
        icon: "↪",
        action: () => {
            if (window.mediCoreAuth?.logout) {
                window.mediCoreAuth.logout();
            } else {
                localStorage.removeItem("medicore_token");
                sessionStorage.removeItem("medicore_token");
                window.location.href = "../login.html";
            }
        }
    }
];

let commandPaletteState = {
    open: false,
    activeIndex: 0,
    filteredCommands: [...commandPaletteData]
};