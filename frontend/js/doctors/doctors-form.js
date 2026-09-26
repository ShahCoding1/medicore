import {
    createDoctor,
    updateDoctor,
    getDoctor
} from "./doctors-data.js";

const form = document.getElementById("doctorForm");
const modalElement = document.getElementById("doctorModal");

let editingDoctorId = null;

// ==========================================
// DEPARTMENT SELECT
// ==========================================

function getDepartmentSelect() {
    return document.getElementById(
        "doctorDepartment"
    );
}

// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments(
    selectedDepartmentId = ""
) {
    const departmentSelect =
        getDepartmentSelect();

    if (!departmentSelect) {
        console.error(
            "Department select #doctorDepartment was not found."
        );
        return;
    }

    departmentSelect.disabled = true;

    departmentSelect.innerHTML = `
        <option value="">
            Loading departments...
        </option>
    `;

    try {
        const response =
            await window.mediCoreAPI.get(
                "/departments",
                {
                    params: {
                        status: "active"
                    }
                }
            );

        console.log(
            "Departments loaded:",
            response.data
        );

        const departments =
            response.data?.data || [];

        departmentSelect.innerHTML = "";

        // Unassigned option
        const unassignedOption =
            document.createElement("option");

        unassignedOption.value = "";
        unassignedOption.textContent =
            "Unassigned";

        departmentSelect.appendChild(
            unassignedOption
        );

        // Department options
        departments.forEach(
            (department) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    department._id;

                option.textContent =
                    `${department.name} (${department.code})`;

                if (
                    selectedDepartmentId &&
                    department._id ===
                        selectedDepartmentId
                ) {
                    option.selected = true;
                }

                departmentSelect.appendChild(
                    option
                );
            }
        );

        if (departments.length === 0) {
            console.warn(
                "No active departments found."
            );
        }

    } catch (error) {
        console.error(
            "Failed to load departments:",
            error
        );

        departmentSelect.innerHTML = `
            <option value="">
                Unable to load departments
            </option>
        `;
    } finally {
        departmentSelect.disabled = false;
    }
}

// ==========================================
// FORM DATA
// ==========================================

function getFormData() {
    const departmentSelect =
        getDepartmentSelect();

    return {
        firstName:
            document
                .getElementById(
                    "doctorFirstName"
                )
                .value
                .trim(),

        lastName:
            document
                .getElementById(
                    "doctorLastName"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "doctorEmail"
                )
                .value
                .trim(),

        phone:
            document
                .getElementById(
                    "doctorPhone"
                )
                .value
                .trim(),

        specialization:
            document
                .getElementById(
                    "doctorSpecialization"
                )
                .value
                .trim(),

        licenseNumber:
            document
                .getElementById(
                    "doctorLicense"
                )
                .value
                .trim(),

        department:
            departmentSelect?.value || null,

        gender:
            document
                .getElementById(
                    "doctorGender"
                )
                .value,

        status:
            document
                .getElementById(
                    "doctorStatus"
                )
                .value
    };
}

// ==========================================
// RESET FORM
// ==========================================

function resetDoctorForm() {
    form.reset();

    editingDoctorId = null;

    document.getElementById(
        "doctorModalTitle"
    ).textContent = "Add Doctor";

    const doctorIdInput =
        document.getElementById(
            "doctorId"
        );

    if (doctorIdInput) {
        doctorIdInput.value = "";
        doctorIdInput.disabled = false;
    }

    const departmentSelect =
        getDepartmentSelect();

    if (departmentSelect) {
        departmentSelect.disabled = false;

        departmentSelect.innerHTML = `
            <option value="">
                Select department
            </option>
        `;
    }
}

// ==========================================
// SUBMIT FORM
// ==========================================

async function handleSubmit(event) {
    event.preventDefault();

    const data = getFormData();

    try {
        if (editingDoctorId) {

            await updateDoctor(
                editingDoctorId,
                data
            );

        } else {

            const doctorId =
                document
                    .getElementById(
                        "doctorId"
                    )
                    .value
                    .trim();

            await createDoctor({
                doctorId,
                ...data
            });
        }

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        modal?.hide();

        resetDoctorForm();

        if (
            typeof window.loadDoctors ===
            "function"
        ) {
            await window.loadDoctors();
        }

    } catch (error) {
        console.error(
            "Doctor form error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to save doctor."
        );
    }
}

// ==========================================
// EDIT DOCTOR
// ==========================================

async function editDoctor(id) {
    try {
        const response =
            await getDoctor(id);

        const doctor =
            response.data?.data;

        if (!doctor) {
            throw new Error(
                "Doctor data not found."
            );
        }

        editingDoctorId =
            doctor._id;

        document.getElementById(
            "doctorModalTitle"
        ).textContent =
            "Edit Doctor";

        const doctorIdInput =
            document.getElementById(
                "doctorId"
            );

        doctorIdInput.value =
            doctor.doctorId || "";

        doctorIdInput.disabled = true;

        document.getElementById(
            "doctorFirstName"
        ).value =
            doctor.firstName || "";

        document.getElementById(
            "doctorLastName"
        ).value =
            doctor.lastName || "";

        document.getElementById(
            "doctorEmail"
        ).value =
            doctor.email || "";

        document.getElementById(
            "doctorPhone"
        ).value =
            doctor.phone || "";

        document.getElementById(
            "doctorSpecialization"
        ).value =
            doctor.specialization || "";

        document.getElementById(
            "doctorLicense"
        ).value =
            doctor.licenseNumber || "";

        document.getElementById(
            "doctorGender"
        ).value =
            doctor.gender || "other";

        document.getElementById(
            "doctorStatus"
        ).value =
            doctor.status || "active";

        const departmentId =
            doctor.department?._id ||
            doctor.department ||
            "";

        await loadDepartments(
            departmentId
        );

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();

    } catch (error) {
        console.error(
            "Failed to load doctor:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to load doctor."
        );
    }
}

// ==========================================
// OPEN ADD DOCTOR
// ==========================================

async function openNewDoctorForm() {

    resetDoctorForm();

    // Load departments BEFORE opening modal
    await loadDepartments();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();
}

// ==========================================
// CLOSE MODAL
// ==========================================

function closeDoctorModal() {
    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    modal?.hide();

    resetDoctorForm();
}

// ==========================================
// INITIALIZE FORM
// ==========================================

function initDoctorForm() {

    if (!form) {
        console.error(
            "Doctor form #doctorForm not found."
        );

        return;
    }

    form.addEventListener(
        "submit",
        handleSubmit
    );
}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.editDoctor =
    editDoctor;

window.openNewDoctorForm =
    openNewDoctorForm;

window.closeDoctorModal =
    closeDoctorModal;

window.loadDoctorDepartments =
    loadDepartments;

// ==========================================
// EXPORTS
// ==========================================

export {
    initDoctorForm,
    loadDepartments,
    openNewDoctorForm,
    editDoctor
};