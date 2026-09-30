import {
    getDoctors,
    deleteDoctor
} from "./doctors-data.js";

import {
    renderDoctors
} from "./doctors-ui.js";

import {
    initDoctorForm,
    editDoctor,
    openNewDoctorForm
} from "./doctors-form.js";

// ==========================================
// FILTER STATE
// ==========================================

let currentFilters = {
    search: "",
    status: "",
    department: ""
};

// ==========================================
// LOAD DOCTORS
// ==========================================

async function loadDoctors() {
    try {
        const response =
            await getDoctors(
                currentFilters
            );

        renderDoctors(
            response.data || [],
            editDoctorHandler,
            deleteDoctorHandler,
            viewDoctorHandler
        );

    } catch (error) {
        console.error(
            "Load doctors error:",
            error
        );

        const tbody =
            document.getElementById(
                "doctorsTableBody"
            );

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="text-center text-danger py-5"
                    >
                        Unable to load doctors.
                    </td>
                </tr>
            `;
        }
    }
}

// ==========================================
// EDIT DOCTOR
// ==========================================

async function editDoctorHandler(id) {
    await editDoctor(id);
}

// ==========================================
// DELETE DOCTOR
// ==========================================

async function deleteDoctorHandler(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteDoctor(id);

        await loadDoctors();

    } catch (error) {
        console.error(
            "Delete doctor error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to delete doctor."
        );
    }
}

// ==========================================
// VIEW DOCTOR
// ==========================================

async function viewDoctorHandler(id) {
    try {
        const response =
            await window.mediCoreAPI.get(
                `/doctors/${id}`
            );

        const doctor =
            response.data?.data;

        if (!doctor) {
            throw new Error(
                "Doctor data not found."
            );
        }

        alert(
            `Doctor: ${doctor.firstName} ${doctor.lastName}\n` +
            `Specialization: ${doctor.specialization}\n` +
            `Department: ${
                doctor.department?.name ||
                "Unassigned"
            }\n` +
            `Phone: ${
                doctor.phone || "—"
            }\n` +
            `Email: ${
                doctor.email || "—"
            }`
        );

    } catch (error) {
        console.error(
            "View doctor error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to load doctor details."
        );
    }
}

// ==========================================
// FILTERS
// ==========================================

function initFilters() {
    const search =
        document.getElementById(
            "doctorSearch"
        );

    const status =
        document.getElementById(
            "doctorStatusFilter"
        );

    let searchTimeout;

    // --------------------------------------
    // Search
    // --------------------------------------

    search?.addEventListener(
        "input",
        () => {
            clearTimeout(
                searchTimeout
            );

            searchTimeout =
                setTimeout(() => {
                    currentFilters.search =
                        search.value.trim();

                    loadDoctors();
                }, 300);
        }
    );

    // --------------------------------------
    // Status
    // --------------------------------------

    status?.addEventListener(
        "change",
        () => {
            currentFilters.status =
                status.value;

            loadDoctors();
        }
    );
}

// ==========================================
// INITIALIZE DOCTORS PAGE
// ==========================================

async function initDoctors() {
    // --------------------------------------
    // Authentication
    // --------------------------------------

    if (
        !window.mediCoreAuth?.requireAuth()
    ) {
        return;
    }

    // --------------------------------------
    // Doctor Form
    // --------------------------------------

    initDoctorForm();

    // --------------------------------------
    // Make loadDoctors available globally
    // --------------------------------------

    window.loadDoctors =
        loadDoctors;

    // --------------------------------------
    // Add Doctor Button
    // --------------------------------------

    document
        .getElementById(
            "addDoctorBtn"
        )
        ?.addEventListener(
            "click",
            openNewDoctorForm
        );

    // --------------------------------------
    // Filters
    // --------------------------------------

    initFilters();

    // --------------------------------------
    // Initial Data
    // --------------------------------------

    await loadDoctors();
}

// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initDoctors
);