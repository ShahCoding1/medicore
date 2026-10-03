const ROLE_PERMISSION_GROUPS = [
    {
        key: "dashboard",
        label: "Dashboard",
        icon: "bi-grid-1x2",
        permissions: [
            ["dashboard.view", "View Dashboard"]
        ]
    },
    {
        key: "patients",
        label: "Patients",
        icon: "bi-people",
        permissions: [
            ["patients.view", "View Patients"],
            ["patients.create", "Create Patients"],
            ["patients.edit", "Edit Patients"],
            ["patients.delete", "Delete Patients"]
        ]
    },
    {
        key: "doctors",
        label: "Doctors",
        icon: "bi-person-badge",
        permissions: [
            ["doctors.view", "View Doctors"],
            ["doctors.create", "Create Doctors"],
            ["doctors.edit", "Edit Doctors"],
            ["doctors.delete", "Delete Doctors"]
        ]
    },
    {
        key: "appointments",
        label: "Appointments",
        icon: "bi-calendar2-check",
        permissions: [
            ["appointments.view", "View Appointments"],
            ["appointments.create", "Create Appointments"],
            ["appointments.edit", "Edit Appointments"],
            ["appointments.delete", "Delete Appointments"]
        ]
    },
    {
        key: "clinical",
        label: "Clinical Records",
        icon: "bi-file-medical",
        permissions: [
            ["medical_records.view", "View Medical Records"],
            ["medical_records.create", "Create Medical Records"],
            ["medical_records.edit", "Edit Medical Records"],
            ["medical_records.delete", "Delete Medical Records"],
            ["prescriptions.view", "View Prescriptions"],
            ["prescriptions.create", "Create Prescriptions"]
        ]
    },
    {
        key: "pharmacy",
        label: "Pharmacy",
        icon: "bi-capsule-pill",
        permissions: [
            ["pharmacy.view", "View Pharmacy"],
            ["pharmacy.create", "Add Inventory"],
            ["pharmacy.edit", "Edit Inventory"],
            ["pharmacy.delete", "Delete Inventory"]
        ]
    },
    {
        key: "laboratory",
        label: "Laboratory",
        icon: "bi-eyedropper",
        permissions: [
            ["laboratory.view", "View Laboratory"],
            ["laboratory.create", "Create Tests"],
            ["laboratory.edit", "Edit Tests"],
            ["laboratory.delete", "Delete Tests"]
        ]
    },
    {
        key: "billing",
        label: "Billing",
        icon: "bi-receipt",
        permissions: [
            ["billing.view", "View Billing"],
            ["billing.create", "Create Invoices"],
            ["billing.edit", "Edit Invoices"],
            ["billing.delete", "Delete Invoices"]
        ]
    },
    {
        key: "operations",
        label: "Hospital Operations",
        icon: "bi-hospital",
        permissions: [
            ["admissions.view", "View Admissions"],
            ["admissions.create", "Create Admissions"],
            ["admissions.edit", "Edit Admissions"],
            ["admissions.delete", "Delete Admissions"],
            ["beds.view", "View Beds"],
            ["beds.manage", "Manage Beds"],
            ["discharges.view", "View Discharges"],
            ["discharges.create", "Create Discharges"]
        ]
    },
    {
        key: "staff",
        label: "Staff",
        icon: "bi-person-vcard",
        permissions: [
            ["staff.view", "View Staff"],
            ["staff.create", "Create Staff"],
            ["staff.edit", "Edit Staff"],
            ["staff.delete", "Delete Staff"]
        ]
    },
    {
        key: "roles",
        label: "Roles & Access",
        icon: "bi-shield-lock",
        permissions: [
            ["roles.view", "View Roles"],
            ["roles.create", "Create Roles"],
            ["roles.edit", "Edit Roles"],
            ["roles.delete", "Delete Roles"],
            ["permissions.manage", "Manage Permissions"]
        ]
    },
    {
        key: "reports",
        label: "Reports & Analytics",
        icon: "bi-bar-chart",
        permissions: [
            ["analytics.view", "View Analytics"],
            ["reports.view", "View Reports"],
            ["reports.export", "Export Reports"]
        ]
    },
    {
        key: "settings",
        label: "Settings",
        icon: "bi-gear",
        permissions: [
            ["settings.view", "View Settings"],
            ["settings.manage", "Manage Settings"],
            ["audit_logs.view", "View Audit Logs"]
        ]
    }
];

function escapeRoleHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function renderRoleSummary() {
    const summary = roleData.summary;

    document.getElementById("rolesTotal").textContent =
        summary.total || 0;

    document.getElementById("rolesActive").textContent =
        summary.active || 0;

    document.getElementById("rolesSystem").textContent =
        summary.systemRoles || 0;

    document.getElementById("rolesCustom").textContent =
        summary.customRoles || 0;
}

function renderRoleCount() {
    const count = roleData.roles.length;

    document.getElementById("rolesCount").textContent =
        `${count} ${count === 1 ? "role" : "roles"}`;
}

function renderRolesTable() {
    const tbody = document.getElementById("rolesTableBody");
    const empty = document.getElementById("rolesEmpty");

    tbody.innerHTML = "";

    if (!roleData.roles.length) {
        empty.classList.remove("d-none");
        document.querySelector(".roles-table").closest(".table-responsive").classList.add("d-none");
        renderRoleCount();
        return;
    }

    empty.classList.add("d-none");
    document.querySelector(".roles-table").closest(".table-responsive").classList.remove("d-none");

    roleData.roles.forEach((role) => {
        const permissions = Array.isArray(role.permissions)
            ? role.permissions
            : [];

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="role-name-cell">
                    <div class="role-avatar">
                        <i class="bi bi-shield-lock-fill"></i>
                    </div>

                    <div>
                        <div class="role-name">
                            ${escapeRoleHTML(role.name)}
                        </div>

                        <span class="role-description">
                            ${escapeRoleHTML(
                                role.description || "No description"
                            )}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <span class="role-key">
                    ${escapeRoleHTML(role.key)}
                </span>
            </td>

            <td>
                <span class="permission-count">
                    <i class="bi bi-key-fill"></i>
                    ${permissions.length} permissions
                </span>
            </td>

            <td>
                <span class="role-type-badge ${
                    role.isSystemRole ? "system" : "custom"
                }">
                    <i class="bi ${
                        role.isSystemRole
                            ? "bi-shield-fill-check"
                            : "bi-person-gear"
                    }"></i>

                    ${role.isSystemRole ? "System" : "Custom"}
                </span>
            </td>

            <td>
                <span class="role-status-badge ${
                    role.isActive ? "active" : "inactive"
                }">
                    <i class="bi ${
                        role.isActive
                            ? "bi-check-circle-fill"
                            : "bi-dash-circle-fill"
                    }"></i>

                    ${role.isActive ? "Active" : "Inactive"}
                </span>
            </td>

            <td>
                <div class="role-action-group">

                    <button
                        type="button"
                        class="role-action-btn"
                        title="View"
                        data-role-action="view"
                        data-id="${role._id}"
                    >
                        <i class="bi bi-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="role-action-btn"
                        title="Edit"
                        data-role-action="edit"
                        data-id="${role._id}"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    ${
                        role.isSystemRole
                            ? ""
                            : `
                                <button
                                    type="button"
                                    class="role-action-btn danger"
                                    title="Delete"
                                    data-role-action="delete"
                                    data-id="${role._id}"
                                >
                                    <i class="bi bi-trash3"></i>
                                </button>
                            `
                    }

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    renderRoleCount();
}

function renderPermissionsMatrix(selected = []) {
    const container =
        document.getElementById("permissionsMatrix");

    const selectedSet = new Set(selected);

    container.innerHTML = ROLE_PERMISSION_GROUPS.map(
        (group) => `
            <div class="permission-group">

                <div class="permission-group-header">

                    <div class="permission-group-title">
                        <i class="bi ${group.icon}"></i>
                        ${group.label}
                    </div>

                    <span
                        class="permission-select-all"
                        data-permission-select="${group.key}"
                    >
                        Select all
                    </span>

                </div>

                <div class="permission-options">

                    ${group.permissions
                        .map(
                            ([value, label]) => `
                                <label class="permission-option">

                                    <input
                                        type="checkbox"
                                        class="permission-checkbox"
                                        value="${value}"
                                        data-permission-group="${group.key}"
                                        ${
                                            selectedSet.has(value)
                                                ? "checked"
                                                : ""
                                        }
                                    >

                                    <span>
                                        ${label}
                                    </span>

                                </label>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `
    ).join("");
}

function getSelectedPermissions() {
    return Array.from(
        document.querySelectorAll(
            ".permission-checkbox:checked"
        )
    ).map((checkbox) => checkbox.value);
}

function showRoleLoading(show) {
    const loading = document.getElementById("rolesLoading");

    if (show) {
        loading.classList.remove("d-none");
    } else {
        loading.classList.add("d-none");
    }
}

function showRoleFormAlert(message, type = "danger") {
    const alert = document.getElementById("roleFormAlert");

    alert.className = `alert alert-${type}`;
    alert.textContent = message;
}

function clearRoleFormAlert() {
    const alert = document.getElementById("roleFormAlert");

    alert.className = "alert d-none";
    alert.textContent = "";
}

function showRoleToast(message, type = "success") {
    const container =
        document.getElementById("roleToastContainer");

    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute("role", "alert");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${escapeRoleHTML(message)}
            </div>

            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
            ></button>
        </div>
    `;

    container.appendChild(toast);

    const instance =
        bootstrap.Toast.getOrCreateInstance(toast, {
            delay: 3500
        });

    instance.show();

    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove();
    });
}

function renderRoleDetails(role) {
    const container =
        document.getElementById("roleDetails");

    const permissions = Array.isArray(role.permissions)
        ? role.permissions
        : [];

    document.getElementById("viewRoleModalLabel").textContent =
        role.name;

    document.getElementById("viewRoleSubtitle").textContent =
        role.description || "Access control details";

    container.innerHTML = `
        <div class="role-details-header">

            <div class="role-details-icon">
                <i class="bi bi-shield-lock-fill"></i>
            </div>

            <div>
                <h3 class="role-details-title">
                    ${escapeRoleHTML(role.name)}
                </h3>

                <span class="role-details-key">
                    ${escapeRoleHTML(role.key)}
                </span>
            </div>

        </div>

        <div class="role-detail-grid">

            <div class="role-detail-item">
                <span>Role Type</span>
                <strong>
                    ${role.isSystemRole ? "System Role" : "Custom Role"}
                </strong>
            </div>

            <div class="role-detail-item">
                <span>Status</span>
                <strong>
                    ${role.isActive ? "Active" : "Inactive"}
                </strong>
            </div>

            <div class="role-detail-item">
                <span>Total Permissions</span>
                <strong>
                    ${permissions.length}
                </strong>
            </div>

            <div class="role-detail-item">
                <span>Created</span>
                <strong>
                    ${role.createdAt
                        ? new Date(role.createdAt).toLocaleDateString()
                        : "—"}
                </strong>
            </div>

        </div>

        <div>
            <div class="role-permissions-title">
                Assigned Permissions
            </div>

            <div class="role-permission-tags">

                ${
                    permissions.length
                        ? permissions
                              .map(
                                  (permission) => `
                                      <span class="role-permission-tag">
                                          ${escapeRoleHTML(permission)}
                                      </span>
                                  `
                              )
                              .join("")
                        : `
                            <span class="text-muted small">
                                No permissions assigned.
                            </span>
                        `
                }

            </div>
        </div>
    `;
}

window.roleUI = {
    ROLE_PERMISSION_GROUPS,
    renderRoleSummary,
    renderRoleCount,
    renderRolesTable,
    renderPermissionsMatrix,
    getSelectedPermissions,
    showRoleLoading,
    showRoleFormAlert,
    clearRoleFormAlert,
    showRoleToast,
    renderRoleDetails
};