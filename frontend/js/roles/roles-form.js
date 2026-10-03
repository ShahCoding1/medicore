const roleForm = {
    modal: null,
    viewModal: null
};

function resetRoleForm() {
    document.getElementById("roleForm").reset();

    document.getElementById("roleStatus").value = "true";

    roleData.editingId = null;

    document.getElementById("roleModalLabel").textContent =
        "Create Role";

    document.getElementById("saveRoleText").textContent =
        "Create Role";

    roleUI.clearRoleFormAlert();

    roleUI.renderPermissionsMatrix([]);
}

function openCreateRoleModal() {
    resetRoleForm();

    roleForm.modal.show();
}

function openEditRoleModal(id) {
    const role = roleDataAPI.getRoleById(id);

    if (!role) {
        roleUI.showRoleToast(
            "Role could not be found.",
            "danger"
        );
        return;
    }

    roleData.editingId = id;

    document.getElementById("roleModalLabel").textContent =
        "Edit Role";

    document.getElementById("saveRoleText").textContent =
        "Save Changes";

    document.getElementById("roleName").value =
        role.name || "";

    document.getElementById("roleKey").value =
        role.key || "";

    document.getElementById("roleDescription").value =
        role.description || "";

    document.getElementById("roleStatus").value =
        String(role.isActive !== false);

    document.getElementById("roleKey").disabled =
        Boolean(role.isSystemRole);

    roleUI.clearRoleFormAlert();

    roleUI.renderPermissionsMatrix(
        Array.isArray(role.permissions)
            ? role.permissions
            : []
    );

    roleForm.modal.show();
}

function collectRolePayload() {
    return {
        name: document.getElementById("roleName").value.trim(),

        key: document.getElementById("roleKey").value.trim(),

        description:
            document
                .getElementById("roleDescription")
                .value
                .trim(),

        isActive:
            document.getElementById("roleStatus").value === "true",

        permissions:
            roleUI.getSelectedPermissions()
    };
}

function validateRolePayload(payload) {
    if (!payload.name) {
        return "Role name is required.";
    }

    if (!payload.key) {
        return "Role key is required.";
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(payload.key)) {
        return "Role key can contain only letters, numbers, underscores and hyphens.";
    }

    return "";
}

async function submitRoleForm(event) {
    event.preventDefault();

    const payload = collectRolePayload();

    const validationError =
        validateRolePayload(payload);

    if (validationError) {
        roleUI.showRoleFormAlert(validationError);
        return;
    }

    const saveButton =
        document.getElementById("saveRoleBtn");

    const spinner =
        document.getElementById("saveRoleSpinner");

    const icon =
        document.getElementById("saveRoleIcon");

    saveButton.disabled = true;
    spinner.classList.remove("d-none");
    icon.classList.add("d-none");

    roleUI.clearRoleFormAlert();

    try {
        if (roleData.editingId) {
            await roleDataAPI.updateRole(
                roleData.editingId,
                payload
            );

            roleUI.showRoleToast(
                "Role updated successfully."
            );
        } else {
            await roleDataAPI.createRole(payload);

            roleUI.showRoleToast(
                "Role created successfully."
            );
        }

        roleForm.modal.hide();

        await refreshRolesPage();

    } catch (error) {
        roleUI.showRoleFormAlert(
            error.response?.data?.message ||
                error.message ||
                "Unable to save role."
        );
    } finally {
        saveButton.disabled = false;
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
    }
}

function viewRole(id) {
    const role = roleDataAPI.getRoleById(id);

    if (!role) {
        roleUI.showRoleToast(
            "Role could not be found.",
            "danger"
        );
        return;
    }

    roleUI.renderRoleDetails(role);

    roleForm.viewModal.show();
}

async function deleteRoleFromPage(id) {
    const role = roleDataAPI.getRoleById(id);

    if (!role) {
        return;
    }

    if (role.isSystemRole) {
        roleUI.showRoleToast(
            "System roles cannot be deleted.",
            "warning"
        );
        return;
    }

    const confirmed = window.confirm(
        `Delete the "${role.name}" role? This action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    try {
        await roleDataAPI.deleteRole(id);

        roleUI.showRoleToast(
            "Role deleted successfully."
        );

        await refreshRolesPage();

    } catch (error) {
        roleUI.showRoleToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to delete role.",
            "danger"
        );
    }
}

function initializeRoleFormModals() {
    roleForm.modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("roleModal")
    );

    roleForm.viewModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("viewRoleModal")
    );
}

window.roleForm = {
    resetRoleForm,
    openCreateRoleModal,
    openEditRoleModal,
    collectRolePayload,
    validateRolePayload,
    submitRoleForm,
    viewRole,
    deleteRoleFromPage,
    initializeRoleFormModals
};