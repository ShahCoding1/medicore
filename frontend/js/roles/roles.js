let roleSearchTimer = null;

async function refreshRolesPage() {
    roleUI.showRoleLoading(true);

    try {
        await roleDataAPI.loadRoleResources();

        roleUI.renderRoleSummary();
        roleUI.renderRolesTable();

    } catch (error) {
        console.error("Roles page error:", error);

        roleUI.showRoleToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to load roles.",
            "danger"
        );
    } finally {
        roleUI.showRoleLoading(false);
    }
}

function handleRoleSearch() {
    clearTimeout(roleSearchTimer);

    roleSearchTimer = setTimeout(() => {
        roleDataAPI.setRoleFilters({
            search:
                document.getElementById("roleSearch").value.trim()
        });

        refreshRolesPage();
    }, 350);
}

function handleRoleStatusFilter() {
    roleDataAPI.setRoleFilters({
        status:
            document.getElementById("roleStatusFilter").value
    });

    refreshRolesPage();
}

function clearRoleFilters() {
    roleDataAPI.clearRoleFilters();

    document.getElementById("roleSearch").value = "";
    document.getElementById("roleStatusFilter").value = "";

    refreshRolesPage();
}

function handleRoleTableAction(event) {
    const button =
        event.target.closest("[data-role-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.roleAction;
    const id = button.dataset.id;

    if (action === "view") {
        roleForm.viewRole(id);
    }

    if (action === "edit") {
        roleForm.openEditRoleModal(id);
    }

    if (action === "delete") {
        roleForm.deleteRoleFromPage(id);
    }
}

function handlePermissionSelectAll(event) {
    const target =
        event.target.closest("[data-permission-select]");

    if (!target) {
        return;
    }

    const group = target.dataset.permissionSelect;

    const checkboxes = document.querySelectorAll(
        `.permission-checkbox[data-permission-group="${group}"]`
    );

    const shouldSelect =
        Array.from(checkboxes).some(
            (checkbox) => !checkbox.checked
        );

    checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldSelect;
    });

    target.textContent = shouldSelect
        ? "Clear all"
        : "Select all";
}

function bindRoleEvents() {
    document
        .getElementById("addRoleBtn")
        .addEventListener(
            "click",
            roleForm.openCreateRoleModal
        );

    document
        .getElementById("emptyCreateRoleBtn")
        .addEventListener(
            "click",
            roleForm.openCreateRoleModal
        );

    document
        .getElementById("refreshRolesBtn")
        .addEventListener(
            "click",
            refreshRolesPage
        );

    document
        .getElementById("clearRoleFilters")
        .addEventListener(
            "click",
            clearRoleFilters
        );

    document
        .getElementById("roleSearch")
        .addEventListener(
            "input",
            handleRoleSearch
        );

    document
        .getElementById("roleStatusFilter")
        .addEventListener(
            "change",
            handleRoleStatusFilter
        );

    document
        .getElementById("rolesTableBody")
        .addEventListener(
            "click",
            handleRoleTableAction
        );

    document
        .getElementById("permissionsMatrix")
        .addEventListener(
            "click",
            handlePermissionSelectAll
        );

    document
        .getElementById("roleForm")
        .addEventListener(
            "submit",
            roleForm.submitRoleForm
        );
}

async function initializeRolesPage() {
    roleForm.initializeRoleFormModals();

    roleUI.renderPermissionsMatrix([]);

    bindRoleEvents();

    await refreshRolesPage();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeRolesPage
);

window.rolesPage = {
    refreshRolesPage
};