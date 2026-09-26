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


let currentFilters = {
    search: "",
    status: "",
    department: ""
};


async function loadDoctors() {
    try {
        const response =
            await getDoctors(currentFilters);

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
                    <td colspan="9"
                        class="text-center text-danger py-5">
                        Unable to load doctors.
                    </td>
                </tr>
            `;
        }
    }
}


async function editDoctorHandler(id) {
    await editDoctor(id);
}


async function deleteDoctorHandler(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this doctor?"
    );

    if (!confirmed) return;

    try {
        await deleteDoctor(id);

        await loadDoctors();

    } catch (error) {
        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to delete doctor."
        );
    }
}


async function viewDoctorHandler(id) {
    try {
        const response =
            await window.mediCoreAPI.get(
                `/doctors/${id}`
            );

        const doctor = response.data.data;

        alert(
            `Doctor: ${doctor.firstName} ${doctor.lastName}\n` +
            `Specialization: ${doctor.specialization}\n` +
            `Department: ${
                doctor.department?.name ||
                "Unassigned"
            }\n` +
            `Phone: ${doctor.phone || "—"}\n` +
            `Email: ${doctor.email || "—"}`
        );

    } catch (error) {
        console.error(error);

        alert(
            "Unable to load doctor details."
        );
    }
}


function initFilters() {
    const search =
        document.getElementById("doctorSearch");

    const status =
        document.getElementById("doctorStatusFilter");

    let searchTimeout;

    search?.addEventListener(
        "input",
        () => {
            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                currentFilters.search =
                    search.value.trim();

                loadDoctors();
            }, 300);
        }
    );

    status?.addEventListener(
        "change",
        () => {
            currentFilters.status =
                status.value;

            loadDoctors();
        }
    );
}


async function initDoctors() {
    if (!window.mediCoreAuth?.requireAuth()) {
        return;
    }

    initDoctorForm({
        onSaved: loadDoctors
    });

    document
        .getElementById("addDoctorBtn")
        ?.addEventListener(
            "click",
            openNewDoctorForm
        );

    initFilters();

    await loadDoctors();
}


document.addEventListener(
    "DOMContentLoaded",
    initDoctors
);