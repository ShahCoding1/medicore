import {
    getDepartments,
    deleteDepartment
} from "./departments-data.js";

import {
    renderDepartments
} from "./departments-ui.js";

import {
    initDepartmentForm,
    editDepartment,
    openNewDepartmentForm
} from "./departments-form.js";

let searchTimer = null;

// ==========================================
// INITIALIZATION
// ==========================================

async function initDepartments() {
    if (
        !window.mediCoreAuth?.requireAuth()
    ) {
        return;
    }

    initDepartmentForm({
        onSaved: loadDepartments
    });

    setupEvents();

    await loadDepartments();
}

// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments() {
    try {
        const search =
            document.getElementById(
                "departmentSearch"
            )?.value.trim() || "";

        const status =
            document.getElementById(
                "departmentStatusFilter"
            )?.value || "";

        const response =
            await getDepartments({
                search,
                status
            });

        renderDepartments(
            response.data || [],
            handleEdit,
            handleDelete,
            handleView
        );

        updateDepartmentCount(
            response.data || []
        );

    } catch (error) {
        console.error(
            "Unable to load departments:",
            error
        );

        alert(
            error.response?.data?.message ||
                "Unable to load departments."
        );
    }
}

// ==========================================
// EVENTS
// ==========================================

function setupEvents() {
    const addButton =
        document.getElementById(
            "addDepartmentButton"
        );

    addButton?.addEventListener(
        "click",
        openNewDepartmentForm
    );

    const searchInput =
        document.getElementById(
            "departmentSearch"
        );

    searchInput?.addEventListener(
        "input",
        () => {
            clearTimeout(searchTimer);

            searchTimer = setTimeout(
                loadDepartments,
                300
            );
        }
    );

    const statusFilter =
        document.getElementById(
            "departmentStatusFilter"
        );

    statusFilter?.addEventListener(
        "change",
        loadDepartments
    );
}

// ==========================================
// ACTIONS
// ==========================================

async function handleEdit(id) {
    await editDepartment(id);
}

async function handleDelete(id) {
    const confirmed =
        window.confirm(
            "Are you sure you want to delete this department?"
        );

    if (!confirmed) {
        return;
    }

    try {
        await window.mediCoreAPI.delete(
            `/departments/${id}`
        );

        await loadDepartments();

    } catch (error) {
        console.error(
            "Unable to delete department:",
            error
        );

        alert(
            error.response?.data?.message ||
                "Unable to delete department."
        );
    }
}

function handleView(id) {
    const row =
        document.querySelector(
            `[data-id="${id}"].department-view`
        );

    if (row) {
        alert(
            "Department details can be expanded here in the detailed department view."
        );
    }
}

// ==========================================
// COUNT
// ==========================================

function updateDepartmentCount(
    departments
) {
    const countElement =
        document.getElementById(
            "departmentCount"
        );

    if (countElement) {
        countElement.textContent =
            departments.length;
    }
}

// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    initDepartments
);