import {
    getPatients,
    deletePatient
} from "./patients-data.js";

import {
    renderPatients
} from "./patients-ui.js";

import {
    initPatientForm,
    editPatient,
    openNewPatientForm,
    closeNewPatientForm
} from "./patients-form.js";

async function initPatients() {
    if (!window.mediCoreAuth?.requireAuth()) {
        return;
    }

    initPatientForm({
        onSaved: loadPatients
    });

    document
        .getElementById("addPatientButton")
        ?.addEventListener(
            "click",
            openNewPatientForm
        );

    document
        .getElementById("closePatientModal")
        ?.addEventListener(
            "click",
            closeNewPatientForm
        );

    document
        .getElementById("cancelPatientButton")
        ?.addEventListener(
            "click",
            closeNewPatientForm
        );

    document
        .getElementById("patientSearch")
        ?.addEventListener(
            "input",
            debounce(
                loadPatients,
                300
            )
        );

    document
        .getElementById("patientStatusFilter")
        ?.addEventListener(
            "change",
            loadPatients
        );

    await loadPatients();
}

async function loadPatients() {
    const search =
        document.getElementById(
            "patientSearch"
        )?.value || "";

    const status =
        document.getElementById(
            "patientStatusFilter"
        )?.value || "";

    try {
        const patients =
            await getPatients({
                search,
                status
            });

        renderPatients(
            patients,
            editPatient,
            handleDelete
        );

    } catch (error) {
        console.error(
            "Unable to load patients:",
            error
        );
    }
}

async function handleDelete(id) {
    const confirmed =
        window.confirm(
            "Are you sure you want to delete this patient?"
        );

    if (!confirmed) return;

    try {
        await deletePatient(id);

        await loadPatients();

    } catch (error) {
        console.error(
            "Unable to delete patient:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to delete patient."
        );
    }
}

function debounce(
    callback,
    delay
) {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);

        timeout = setTimeout(
            () => callback(...args),
            delay
        );
    };
}

document.addEventListener(
    "DOMContentLoaded",
    initPatients
);