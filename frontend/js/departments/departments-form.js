import {
    getDepartment,
    createDepartment,
    updateDepartment
} from "./departments-data.js";

let editingDepartmentId = null;
let savedCallback = null;

export function initDepartmentForm({
    onSaved
} = {}) {
    savedCallback = onSaved || null;

    const form =
        document.getElementById(
            "departmentForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleSubmit
    );
}

async function handleSubmit(event) {
    event.preventDefault();

    const form =
        event.currentTarget;

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );

    const data = {
        name:
            document.getElementById(
                "departmentName"
            ).value.trim(),

        code:
            document.getElementById(
                "departmentCode"
            ).value.trim(),

        description:
            document.getElementById(
                "departmentDescription"
            ).value.trim(),

        phone:
            document.getElementById(
                "departmentPhone"
            ).value.trim(),

        location:
            document.getElementById(
                "departmentLocation"
            ).value.trim(),

        status:
            document.getElementById(
                "departmentStatus"
            ).value
    };

    if (
        !data.name ||
        !data.code
    ) {
        alert(
            "Department name and code are required."
        );

        return;
    }

    try {
        submitButton.disabled = true;

        if (editingDepartmentId) {
            await updateDepartment(
                editingDepartmentId,
                data
            );
        } else {
            await createDepartment(data);
        }

        closeDepartmentModal();

        if (savedCallback) {
            await savedCallback();
        }

    } catch (error) {
        console.error(
            "Department form error:",
            error
        );

        alert(
            error.response?.data?.message ||
                "Unable to save department."
        );

    } finally {
        submitButton.disabled = false;
    }
}

export async function editDepartment(id) {
    try {
        const response =
            await getDepartment(id);

        const department =
            response.data;

        editingDepartmentId = id;

        document.getElementById(
            "departmentName"
        ).value =
            department.name || "";

        document.getElementById(
            "departmentCode"
        ).value =
            department.code || "";

        document.getElementById(
            "departmentDescription"
        ).value =
            department.description || "";

        document.getElementById(
            "departmentPhone"
        ).value =
            department.phone || "";

        document.getElementById(
            "departmentLocation"
        ).value =
            department.location || "";

        document.getElementById(
            "departmentStatus"
        ).value =
            department.status || "active";

        document.getElementById(
            "departmentCode"
        ).disabled = true;

        const title =
            document.getElementById(
                "departmentModalLabel"
            );

        if (title) {
            title.textContent =
                "Edit Department";
        }

        const modalElement =
            document.getElementById(
                "departmentModal"
            );

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();

    } catch (error) {
        console.error(
            "Unable to load department:",
            error
        );

        alert(
            error.response?.data?.message ||
                "Unable to load department."
        );
    }
}

export function openNewDepartmentForm() {
    resetDepartmentForm();

    const modalElement =
        document.getElementById(
            "departmentModal"
        );

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();
}

export function resetDepartmentForm() {
    editingDepartmentId = null;

    const form =
        document.getElementById(
            "departmentForm"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "departmentStatus"
    ).value = "active";

    document.getElementById(
        "departmentCode"
    ).disabled = false;

    const title =
        document.getElementById(
            "departmentModalLabel"
        );

    if (title) {
        title.textContent =
            "Add Department";
    }
}

export function closeDepartmentModal() {
    const modalElement =
        document.getElementById(
            "departmentModal"
        );

    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    if (modal) {
        modal.hide();
    }

    resetDepartmentForm();
}