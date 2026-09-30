import {
    getAppointments,
    deleteAppointment
} from "./appointments-data.js";

import {
    renderAppointments
} from "./appointments-ui.js";

import {
    initAppointmentForm,
    editAppointment,
    openNewAppointmentForm
} from "./appointments-form.js";

// ==========================================
// FILTER STATE
// ==========================================

let currentFilters = {
    search: "",
    status: "",
    date: ""
};

// ==========================================
// LOAD APPOINTMENTS
// ==========================================

async function loadAppointments() {
    try {
        const response =
            await getAppointments(
                currentFilters
            );

        renderAppointments(
            response.data || [],
            editAppointmentHandler,
            deleteAppointmentHandler,
            viewAppointmentHandler
        );

    } catch (error) {
        console.error(
            "Load appointments error:",
            error
        );

        const tbody =
            document.getElementById(
                "appointmentsTableBody"
            );

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="text-center text-danger py-5"
                    >
                        Unable to load appointments.
                    </td>
                </tr>
            `;
        }
    }
}

// ==========================================
// EDIT
// ==========================================

async function editAppointmentHandler(id) {
    await editAppointment(id);
}

// ==========================================
// DELETE
// ==========================================

async function deleteAppointmentHandler(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteAppointment(id);

        await loadAppointments();

    } catch (error) {
        console.error(
            "Delete appointment error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to delete appointment."
        );
    }
}

// ==========================================
// VIEW
// ==========================================

async function viewAppointmentHandler(id) {
    try {
        const response =
            await window.mediCoreAPI.get(
                `/appointments/${id}`
            );

        const appointment =
            response.data?.data;

        if (!appointment) {
            throw new Error(
                "Appointment not found."
            );
        }

        const patient =
            appointment.patient;

        const doctor =
            appointment.doctor;

        const appointmentDate =
            new Date(
                appointment.appointmentDate
            );

        alert(
            `Patient: ${
                patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "Unknown"
            }\n` +
            `Doctor: ${
                doctor
                    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                    : "Unknown"
            }\n` +
            `Date: ${
                appointmentDate.toLocaleDateString()
            }\n` +
            `Time: ${
                appointmentDate.toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
            }\n` +
            `Status: ${
                appointment.status
            }\n` +
            `Reason: ${
                appointment.reason || "—"
            }`
        );

    } catch (error) {
        console.error(
            "View appointment error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to load appointment details."
        );
    }
}

// ==========================================
// FILTERS
// ==========================================

function initFilters() {
    const search =
        document.getElementById(
            "appointmentSearch"
        );

    const status =
        document.getElementById(
            "appointmentStatusFilter"
        );

    const date =
        document.getElementById(
            "appointmentDateFilter"
        );

    const clearButton =
        document.getElementById(
            "clearAppointmentFilters"
        );

    let searchTimeout;

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

                    loadAppointments();
                }, 300);
        }
    );

    status?.addEventListener(
        "change",
        () => {
            currentFilters.status =
                status.value;

            loadAppointments();
        }
    );

    date?.addEventListener(
        "change",
        () => {
            currentFilters.date =
                date.value;

            loadAppointments();
        }
    );

    clearButton?.addEventListener(
        "click",
        () => {
            currentFilters = {
                search: "",
                status: "",
                date: ""
            };

            if (search) {
                search.value = "";
            }

            if (status) {
                status.value = "";
            }

            if (date) {
                date.value = "";
            }

            loadAppointments();
        }
    );
}

// ==========================================
// ADD APPOINTMENT BUTTON
// ==========================================

function initAddAppointmentButton() {
    const button =
        document.getElementById(
            "addAppointmentBtn"
        );

    if (!button) {
        console.error(
            "Add Appointment button not found."
        );

        return;
    }

    button.addEventListener(
        "click",
        async () => {
            try {
                await openNewAppointmentForm();

            } catch (error) {
                console.error(
                    "Open appointment form error:",
                    error
                );

                alert(
                    "Unable to open appointment form."
                );
            }
        }
    );
}

// ==========================================
// INITIALIZE
// ==========================================

async function initAppointments() {
    if (
        !window.mediCoreAuth?.requireAuth()
    ) {
        return;
    }

    initAppointmentForm();

    window.loadAppointments =
        loadAppointments;

    initAddAppointmentButton();

    initFilters();

    await loadAppointments();
}

// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initAppointments
);