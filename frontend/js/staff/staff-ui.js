const staffUI = {

    escape(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    getName(member) {
        return `${member.firstName || ""} ${member.lastName || ""}`.trim();
    },

    getInitials(member) {
        const first = member.firstName?.charAt(0) || "";
        const last = member.lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase() || "ST";
    },

    formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    },

    formatStatus(status) {
        const labels = {
            active: "Active",
            inactive: "Inactive",
            on_leave: "On Leave",
            suspended: "Suspended"
        };

        return labels[status] || status || "Unknown";
    },

    statusClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace("_", "-");
    },

    departmentName(member) {
        if (!member.department) {
            return "Unassigned";
        }

        if (typeof member.department === "string") {
            const department = staffData.departments.find(
                (item) => String(item._id) === String(member.department)
            );

            return department?.name || "Unassigned";
        }

        return member.department.name || "Unassigned";
    },

    renderSummary() {
        const summary = staffData.summary;

        const total = document.getElementById("staffTotal");
        const active = document.getElementById("staffActive");
        const onLeave = document.getElementById("staffOnLeave");
        const inactive = document.getElementById("staffInactive");

        if (total) {
            total.textContent = summary.total;
        }

        if (active) {
            active.textContent = summary.active;
        }

        if (onLeave) {
            onLeave.textContent = summary.onLeave;
        }

        if (inactive) {
            inactive.textContent =
                summary.inactive + summary.suspended;
        }
    },

    renderRoleFilter() {
        const select = document.getElementById("staffRoleFilter");

        if (!select) {
            return;
        }

        const current = staffData.filters.role;

        select.innerHTML = `
            <option value="">All Roles</option>
            ${staffData.getRoles()
                .map(
                    (role) => `
                        <option value="${this.escape(role)}">
                            ${this.escape(role)}
                        </option>
                    `
                )
                .join("")}
        `;

        select.value = current;
    },

    renderDepartmentOptions() {
        const selects = [
            document.getElementById("staffDepartmentFilter"),
            document.getElementById("staffDepartment")
        ];

        selects.forEach((select) => {
            if (!select) {
                return;
            }

            const current = select.value;

            const isFilter =
                select.id === "staffDepartmentFilter";

            select.innerHTML = `
                <option value="">
                    ${isFilter ? "All Departments" : "Select Department"}
                </option>

                ${staffData.departments
                    .map(
                        (department) => `
                            <option value="${this.escape(department._id)}">
                                ${this.escape(
                                    department.name || "Unnamed Department"
                                )}
                            </option>
                        `
                    )
                    .join("")}
            `;

            if (current) {
                select.value = current;
            }
        });
    },

    renderCount() {
        const element = document.getElementById("staffCount");

        if (!element) {
            return;
        }

        const count = staffData.staff.length;

        element.textContent =
            `${count} ${count === 1 ? "staff member" : "staff members"}`;
    },

    renderTable() {
        const tbody = document.getElementById("staffTableBody");
        const wrapper = document.getElementById("staffTableWrapper");
        const empty = document.getElementById("staffEmpty");

        if (!tbody || !wrapper || !empty) {
            return;
        }

        this.renderCount();

        if (!staffData.staff.length) {
            tbody.innerHTML = "";
            wrapper.hidden = true;
            empty.hidden = false;
            return;
        }

        wrapper.hidden = false;
        empty.hidden = true;

        tbody.innerHTML = staffData.staff
            .map((member) => {
                const name = this.getName(member);
                const initials = this.getInitials(member);
                const department = this.departmentName(member);
                const statusClass = this.statusClass(member.status);

                const avatar = member.photo
                    ? `
                        <img
                            src="${this.escape(member.photo)}"
                            alt="${this.escape(name)}"
                            onerror="this.style.display='none';this.parentElement.innerText='${initials}'"
                        >
                    `
                    : initials;

                return `
                    <tr>

                        <td>
                            <div class="staff-person">

                                <div class="staff-avatar">
                                    ${avatar}
                                </div>

                                <div>
                                    <div class="staff-person-name">
                                        ${this.escape(name)}
                                    </div>

                                    <div class="staff-person-email">
                                        ${this.escape(member.email || "—")}
                                    </div>
                                </div>

                            </div>
                        </td>

                        <td>
                            <span class="staff-id">
                                ${this.escape(member.employeeId || "—")}
                            </span>
                        </td>

                        <td>
                            <span class="staff-role">
                                ${this.escape(member.role || "—")}
                            </span>
                        </td>

                        <td>
                            <span class="staff-department">
                                ${this.escape(department)}
                            </span>
                        </td>

                        <td>
                            <div class="staff-contact">

                                <div class="staff-contact-email">
                                    ${this.escape(member.email || "—")}
                                </div>

                                <div class="staff-contact-phone">
                                    ${this.escape(member.phone || "—")}
                                </div>

                            </div>
                        </td>

                        <td>
                            <span class="staff-status ${statusClass}">
                                ${this.escape(
                                    this.formatStatus(member.status)
                                )}
                            </span>
                        </td>

                        <td>
                            <span class="staff-last-active">
                                ${this.formatDate(member.lastActive)}
                            </span>
                        </td>

                        <td>
                            <div class="staff-actions">

                                <button
                                    type="button"
                                    class="staff-action-btn"
                                    data-action="view"
                                    data-id="${member._id}"
                                    title="View"
                                >
                                    <i class="bi bi-eye"></i>
                                </button>

                                <button
                                    type="button"
                                    class="staff-action-btn"
                                    data-action="edit"
                                    data-id="${member._id}"
                                    title="Edit"
                                >
                                    <i class="bi bi-pencil"></i>
                                </button>

                                <button
                                    type="button"
                                    class="staff-action-btn delete"
                                    data-action="delete"
                                    data-id="${member._id}"
                                    title="Delete"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </div>
                        </td>

                    </tr>
                `;
            })
            .join("");
    },

    showLoading(show = true) {
        const loading = document.getElementById("staffLoading");
        const wrapper = document.getElementById("staffTableWrapper");
        const empty = document.getElementById("staffEmpty");

        if (loading) {
            loading.hidden = !show;
        }

        if (show) {
            if (wrapper) wrapper.hidden = true;
            if (empty) empty.hidden = true;
        }
    },

    showFormAlert(message, type = "danger") {
        const alert = document.getElementById("staffFormAlert");

        if (!alert) {
            return;
        }

        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.hidden = !message;
    },

    showToast(message, type = "success") {
        const container =
            document.getElementById("staffToastContainer");

        if (!container) {
            return;
        }

        const id = `staffToast-${Date.now()}`;

        container.insertAdjacentHTML(
            "beforeend",
            `
                <div
                    id="${id}"
                    class="toast align-items-center text-bg-${type} border-0"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div class="d-flex">
                        <div class="toast-body">
                            ${this.escape(message)}
                        </div>

                        <button
                            type="button"
                            class="btn-close btn-close-white me-2 m-auto"
                            data-bs-dismiss="toast"
                        ></button>
                    </div>
                </div>
            `
        );

        const element = document.getElementById(id);

        const toast = new bootstrap.Toast(element, {
            delay: 3000
        });

        toast.show();

        element.addEventListener("hidden.bs.toast", () => {
            element.remove();
        });
    },

    setSaveLoading(loading) {
        const button = document.getElementById("saveStaffBtn");
        const spinner = document.getElementById("saveStaffSpinner");
        const icon = document.getElementById("saveStaffIcon");
        const text = document.getElementById("saveStaffText");

        if (button) {
            button.disabled = loading;
        }

        if (spinner) {
            spinner.hidden = !loading;
        }

        if (icon) {
            icon.hidden = loading;
        }

        if (text) {
            text.textContent = loading
                ? "Saving..."
                : staffData.editingId
                    ? "Update Staff"
                    : "Save Staff";
        }
    },

    openModal(id) {
        const element = document.getElementById(id);

        if (!element) {
            return null;
        }

        const modal = bootstrap.Modal.getOrCreateInstance(element);
        modal.show();

        return modal;
    },

    closeModal(id) {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        const modal = bootstrap.Modal.getInstance(element);

        if (modal) {
            modal.hide();
        }
    },

    renderDetails(member) {
        const container = document.getElementById("staffDetails");

        if (!container || !member) {
            return;
        }

        const name = this.getName(member);
        const initials = this.getInitials(member);
        const department = this.departmentName(member);

        const avatar = member.photo
            ? `
                <img
                    src="${this.escape(member.photo)}"
                    alt="${this.escape(name)}"
                >
            `
            : initials;

        const profileItem = (label, value, multiline = false) => `
            <div class="profile-item">
                <div class="profile-label">${label}</div>
                <div class="profile-value ${multiline ? "multiline" : ""}">
                    ${this.escape(value || "—")}
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="staff-profile-header">

                <div class="staff-profile-avatar">
                    ${avatar}
                </div>

                <div>
                    <div class="staff-profile-name">
                        ${this.escape(name)}
                    </div>

                    <div class="staff-profile-role">
                        ${this.escape(member.professionalTitle || member.role || "Staff")}
                        · ${this.escape(member.employeeId || "No ID")}
                    </div>
                </div>

            </div>

            <div class="staff-profile-grid">

                <div class="staff-profile-section">
                    <h6>Personal Information</h6>

                    ${profileItem("Email", member.email)}
                    ${profileItem("Phone", member.phone)}
                    ${profileItem("Employee ID", member.employeeId)}
                </div>

                <div class="staff-profile-section">
                    <h6>Professional Information</h6>

                    ${profileItem("Role", member.role)}
                    ${profileItem("Department", department)}
                    ${profileItem("Professional Title", member.professionalTitle)}
                    ${profileItem("Qualification", member.qualification)}
                    ${profileItem("Specialization", member.specialization)}
                </div>

                <div class="staff-profile-section">
                    <h6>Employment</h6>

                    ${profileItem(
                        "Employment Type",
                        String(member.employmentType || "")
                            .replace("_", " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())
                    )}

                    ${profileItem(
                        "Joining Date",
                        this.formatDate(member.joiningDate)
                    )}

                    ${profileItem(
                        "Status",
                        this.formatStatus(member.status)
                    )}

                    ${profileItem(
                        "Last Active",
                        this.formatDate(member.lastActive)
                    )}
                </div>

                <div class="staff-profile-section">
                    <h6>Schedule & Permissions</h6>

                    ${profileItem("Schedule", member.schedule, true)}

                    ${profileItem(
                        "Permissions",
                        Array.isArray(member.permissions)
                            ? member.permissions.join(", ")
                            : member.permissions,
                        true
                    )}
                </div>

                <div class="staff-profile-section">
                    <h6>Activity & Security</h6>

                    ${profileItem("Activity", member.activity, true)}
                    ${profileItem("Security Notes", member.securityNotes, true)}
                </div>

                <div class="staff-profile-section">
                    <h6>Notes</h6>

                    ${profileItem("Additional Notes", member.notes, true)}
                </div>

            </div>
        `;
    }
};

window.staffUI = staffUI;