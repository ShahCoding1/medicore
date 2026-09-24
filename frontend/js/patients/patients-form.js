import {
    createPatient,
    updatePatient,
    getPatient
} from "./patients-data.js";

export function initPatientForm({
    onSaved
}) {
    const form =
        document.getElementById(
            "patientForm"
        );

    if (!form) return;

    form.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const patientId =
                document.getElementById(
                    "patientId"
                ).value.trim();

            const firstName =
                document.getElementById(
                    "firstName"
                ).value.trim();

            const lastName =
                document.getElementById(
                    "lastName"
                ).value.trim();

            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();

            const gender =
                document.getElementById(
                    "gender"
                ).value;

            const dateOfBirth =
                document.getElementById(
                    "dateOfBirth"
                ).value;

            const department =
                document.getElementById(
                    "department"
                ).value;

            const editId =
                form.dataset.editId;

            const payload = {
                patientId,
                firstName,
                lastName,
                phone,
                gender,
                dateOfBirth:
                    dateOfBirth || null,
                department:
                    department || null
            };

            try {
                let result;

                if (editId) {
                    delete payload.patientId;

                    result =
                        await updatePatient(
                            editId,
                            payload
                        );
                } else {
                    result =
                        await createPatient(
                            payload
                        );
                }

                if (!result?.success) {
                    throw new Error(
                        result?.message ||
                        "Unable to save patient."
                    );
                }

                form.reset();
                delete form.dataset.editId;

                closePatientModal();

                onSaved?.();

            } catch (error) {
                console.error(
                    "Patient form error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to save patient."
                );
            }
        }
    );
}

export async function editPatient(
    id
) {
    const patient =
        await getPatient(id);

    if (!patient) return;

    const form =
        document.getElementById(
            "patientForm"
        );

    form.dataset.editId = id;

    document.getElementById(
        "patientId"
    ).value = patient.patientId || "";

    document.getElementById(
        "patientId"
    ).disabled = true;

    document.getElementById(
        "firstName"
    ).value = patient.firstName || "";

    document.getElementById(
        "lastName"
    ).value = patient.lastName || "";

    document.getElementById(
        "phone"
    ).value = patient.phone || "";

    document.getElementById(
        "gender"
    ).value = patient.gender || "other";

    document.getElementById(
        "dateOfBirth"
    ).value = patient.dateOfBirth
        ? patient.dateOfBirth.split("T")[0]
        : "";

    document.getElementById(
        "department"
    ).value =
        patient.department?._id || "";

    document.getElementById(
        "patientModalTitle"
    ).textContent =
        "Edit Patient";

    showPatientModal();
}

export function resetPatientForm() {
    const form =
        document.getElementById(
            "patientForm"
        );

    if (!form) return;

    form.reset();

    delete form.dataset.editId;

    const patientId =
        document.getElementById(
            "patientId"
        );

    if (patientId) {
        patientId.disabled = false;
    }

    const title =
        document.getElementById(
            "patientModalTitle"
        );

    if (title) {
        title.textContent =
            "Add New Patient";
    }
}

function showPatientModal() {
    const modal =
        document.getElementById(
            "patientModal"
        );

    if (!modal) return;

    modal.classList.add("show");
    modal.style.display = "block";
    modal.removeAttribute("aria-hidden");

    document.body.classList.add(
        "modal-open"
    );
}

function closePatientModal() {
    const modal =
        document.getElementById(
            "patientModal"
        );

    if (!modal) return;

    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    resetPatientForm();
}

export function openNewPatientForm() {
    resetPatientForm();
    showPatientModal();
}

export function closeNewPatientForm() {
    closePatientModal();
}