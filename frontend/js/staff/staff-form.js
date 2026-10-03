const staffForm = {

    reset() {
        const form = document.getElementById("staffForm");

        if (form) {
            form.reset();
        }

        staffData.editingId = null;

        const label = document.getElementById("staffModalLabel");

        if (label) {
            label.textContent = "Add Staff";
        }

        staffUI.showFormAlert("");

        staffUI.setSaveLoading(false);
        staffUI.renderDepartmentOptions();
    },

    openCreate() {
        this.reset();
        staffUI.openModal("staffModal");
    },

    openEdit(id) {
        const member = staffData.getStaffById(id);

        if (!member) {
            staffUI.showToast("Staff member not found.", "danger");
            return;
        }

        staffData.editingId = id;

        const fields = {
            staffFirstName: member.firstName,
            staffLastName: member.lastName,
            staffEmail: member.email,
            staffPhone: member.phone,
            staffPhoto: member.photo,
            staffRole: member.role,
            staffProfessionalTitle: member.professionalTitle,
            staffDepartment:
                typeof member.department === "object"
                    ? member.department?._id
                    : member.department,
            staffEmploymentType: member.employmentType,
            staffQualification: member.qualification,
            staffSpecialization: member.specialization,
            staffJoiningDate: member.joiningDate
                ? String(member.joiningDate).slice(0, 10)
                : "",
            staffStatus: member.status,
            staffSchedule: member.schedule,
            staffPermissions: Array.isArray(member.permissions)
                ? member.permissions.join(", ")
                : member.permissions || "",
            staffSecurityNotes: member.securityNotes,
            staffActivity: member.activity,
            staffNotes: member.notes
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);

            if (element) {
                element.value = value ?? "";
            }
        });

        const label = document.getElementById("staffModalLabel");

        if (label) {
            label.textContent = "Edit Staff";
        }

        staffUI.showFormAlert("");
        staffUI.setSaveLoading(false);

        staffUI.openModal("staffModal");
    },

    collectPayload() {
        const permissionsValue =
            document.getElementById("staffPermissions")?.value || "";

        return {
            firstName:
                document.getElementById("staffFirstName")?.value.trim(),

            lastName:
                document.getElementById("staffLastName")?.value.trim(),

            email:
                document.getElementById("staffEmail")?.value.trim(),

            phone:
                document.getElementById("staffPhone")?.value.trim(),

            photo:
                document.getElementById("staffPhoto")?.value.trim(),

            role:
                document.getElementById("staffRole")?.value.trim(),

            professionalTitle:
                document.getElementById("staffProfessionalTitle")?.value.trim(),

            department:
                document.getElementById("staffDepartment")?.value || undefined,

            employmentType:
                document.getElementById("staffEmploymentType")?.value,

            qualification:
                document.getElementById("staffQualification")?.value.trim(),

            specialization:
                document.getElementById("staffSpecialization")?.value.trim(),

            joiningDate:
                document.getElementById("staffJoiningDate")?.value || undefined,

            status:
                document.getElementById("staffStatus")?.value,

            schedule:
                document.getElementById("staffSchedule")?.value.trim(),

            permissions: permissionsValue
                ? permissionsValue
                    .split(",")
                    .map((permission) => permission.trim())
                    .filter(Boolean)
                : [],

            activity:
                document.getElementById("staffActivity")?.value.trim(),

            securityNotes:
                document.getElementById("staffSecurityNotes")?.value.trim(),

            notes:
                document.getElementById("staffNotes")?.value.trim()
        };
    },

    validate(payload) {
        if (!payload.firstName) {
            return "First name is required.";
        }

        if (!payload.lastName) {
            return "Last name is required.";
        }

        if (!payload.email) {
            return "Email is required.";
        }

        if (!payload.role) {
            return "Role is required.";
        }

        return null;
    },

    async submit(event) {
        event.preventDefault();

        staffUI.showFormAlert("");

        const payload = this.collectPayload();
        const validationError = this.validate(payload);

        if (validationError) {
            staffUI.showFormAlert(validationError);
            return;
        }

        staffUI.setSaveLoading(true);

        try {
            if (staffData.editingId) {
                await staffData.updateStaff(
                    staffData.editingId,
                    payload
                );

                staffUI.showToast(
                    "Staff member updated successfully."
                );
            } else {
                await staffData.createStaff(payload);

                staffUI.showToast(
                    "Staff member created successfully."
                );
            }

            staffUI.closeModal("staffModal");

            await staffData.refresh();

            staffUI.renderSummary();
            staffUI.renderRoleFilter();
            staffUI.renderTable();

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Unable to save staff member.";

            staffUI.showFormAlert(message);

        } finally {
            staffUI.setSaveLoading(false);
        }
    },

    async delete(id) {
        const member = staffData.getStaffById(id);

        if (!member) {
            return;
        }

        const name = staffUI.getName(member);

        const confirmed = window.confirm(
            `Delete staff member "${name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            await staffData.deleteStaff(id);

            staffUI.showToast(
                "Staff member deleted successfully."
            );

            await staffData.refresh();

            staffUI.renderSummary();
            staffUI.renderRoleFilter();
            staffUI.renderTable();

        } catch (error) {
            staffUI.showToast(
                error.response?.data?.message ||
                "Unable to delete staff member.",
                "danger"
            );
        }
    },

    view(id) {
        const member = staffData.getStaffById(id);

        if (!member) {
            staffUI.showToast("Staff member not found.", "danger");
            return;
        }

        const name = staffUI.getName(member);

        document.getElementById(
            "viewStaffModalLabel"
        ).textContent = "Staff Profile";

        document.getElementById(
            "viewStaffSubtitle"
        ).textContent =
            `${name} · ${member.employeeId || "Staff Member"}`;

        staffUI.renderDetails(member);
        staffUI.openModal("viewStaffModal");
    }
};

window.staffForm = staffForm;