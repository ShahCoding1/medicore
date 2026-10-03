const admissionsFormState = {
    mode: "create",
    editingId: null,
    patients: [],
    doctors: [],
    departments: []
};

const admissionsFormElements = {};

const cacheAdmissionFormElements = () => {
    const ids = [
        "admissionModal",
        "admissionModalLabel",
        "admissionForm",
        "admissionFormAlert",
        "admissionNumber",
        "admissionPatient",
        "admissionDoctor",
        "admissionDepartment",
        "admissionDate",
        "expectedDischargeDate",
        "admissionType",
        "admissionPriority",
        "admissionReason",
        "admissionDiagnosis",
        "admissionSymptoms",
        "admissionWard",
        "admissionRoom",
        "admissionBed",
        "admissionStatus",
        "admissionNotes",
        "saveAdmissionBtn",
        "saveAdmissionSpinner",
        "saveAdmissionIcon",
        "saveAdmissionText"
    ];

    ids.forEach((id) => {
        admissionsFormElements[id] =
            document.getElementById(id);
    });
};

const resetAdmissionForm = () => {
    const form =
        admissionsFormElements.admissionForm;

    form?.reset();

    admissionsFormState.mode = "create";
    admissionsFormState.editingId = null;

    if (
        admissionsFormElements
            .admissionModalLabel
    ) {
        admissionsFormElements
            .admissionModalLabel
            .textContent =
            "New Admission";
    }

    if (
        admissionsFormElements
            .saveAdmissionText
    ) {
        admissionsFormElements
            .saveAdmissionText
            .textContent =
            "Create Admission";
    }

    if (
        admissionsFormElements
            .admissionDate
    ) {
        admissionsFormElements
            .admissionDate
            .value =
            window.mediCoreAdmissionsData
                .toDateTimeLocalValue(
                    new Date()
                );
    }

    if (
        admissionsFormElements
            .admissionType
    ) {
        admissionsFormElements
            .admissionType
            .value =
            "routine";
    }

    if (
        admissionsFormElements
            .admissionPriority
    ) {
        admissionsFormElements
            .admissionPriority
            .value =
            "normal";
    }

    if (
        admissionsFormElements
            .admissionStatus
    ) {
        admissionsFormElements
            .admissionStatus
            .value =
            "admitted";
    }

    hideAdmissionAlert();
};

const populateSelect = (
    select,
    items,
    placeholder,
    getValue,
    getLabel
) => {
    if (!select) return;

    select.innerHTML =
        `<option value="">${placeholder}</option>`;

    items.forEach((item) => {
        const option =
            document.createElement("option");

        option.value =
            getValue(item);

        option.textContent =
            getLabel(item);

        select.appendChild(option);
    });
};

const loadAdmissionLookups = async () => {
    try {
        const data =
            window.mediCoreAdmissionsData;

        const [
            patients,
            doctors,
            departments
        ] = await Promise.all([
            data.getPatients(),
            data.getDoctors(),
            data.getDepartments()
        ]);

        admissionsFormState.patients =
            patients;

        admissionsFormState.doctors =
            doctors;

        admissionsFormState.departments =
            departments;

        populateSelect(
            admissionsFormElements
                .admissionPatient,
            patients,
            "Select patient",
            (patient) => patient._id,
            (patient) => {
                const name =
                    data.getPatientName(
                        patient
                    );

                return patient.patientId
                    ? `${name} (${patient.patientId})`
                    : name;
            }
        );

        populateSelect(
            admissionsFormElements
                .admissionDoctor,
            doctors,
            "Select doctor",
            (doctor) => doctor._id,
            (doctor) =>
                data.getDoctorName(
                    doctor
                )
        );

        populateSelect(
            admissionsFormElements
                .admissionDepartment,
            departments,
            "Select department",
            (department) =>
                department._id,
            (department) =>
                department.code
                    ? `${department.name} (${department.code})`
                    : department.name
        );
    } catch (error) {
        console.error(
            "Admission lookup error:",
            error
        );

        showAdmissionAlert(
            window.mediCoreAdmissionsData
                .getErrorMessage(error),
            "danger"
        );
    }
};

const setFormValue = (
    element,
    value
) => {
    if (element) {
        element.value =
            value ?? "";
    }
};

const openCreateAdmission = async () => {
    resetAdmissionForm();

    await loadAdmissionLookups();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            admissionsFormElements
                .admissionModal
        );

    modal.show();
};

const openEditAdmission = async (
    admission
) => {
    if (!admission) return;

    admissionsFormState.mode = "edit";
    admissionsFormState.editingId =
        admission._id;

    await loadAdmissionLookups();

    setFormValue(
        admissionsFormElements
            .admissionNumber,
        admission.admissionNumber
    );

    setFormValue(
        admissionsFormElements
            .admissionPatient,
        admission.patient?._id ||
            admission.patient
    );

    setFormValue(
        admissionsFormElements
            .admissionDoctor,
        admission.attendingDoctor?._id ||
            admission.attendingDoctor
    );

    setFormValue(
        admissionsFormElements
            .admissionDepartment,
        admission.department?._id ||
            admission.department
    );

    setFormValue(
        admissionsFormElements
            .admissionDate,
        window.mediCoreAdmissionsData
            .toDateTimeLocalValue(
                admission.admissionDate
            )
    );

    setFormValue(
        admissionsFormElements
            .expectedDischargeDate,
        window.mediCoreAdmissionsData
            .toDateTimeLocalValue(
                admission.expectedDischargeDate
            )
    );

    setFormValue(
        admissionsFormElements
            .admissionType,
        admission.admissionType
    );

    setFormValue(
        admissionsFormElements
            .admissionPriority,
        admission.priority
    );

    setFormValue(
        admissionsFormElements
            .admissionReason,
        admission.reason
    );

    setFormValue(
        admissionsFormElements
            .admissionDiagnosis,
        admission.diagnosis
    );

    setFormValue(
        admissionsFormElements
            .admissionSymptoms,
        admission.symptoms
    );

    setFormValue(
        admissionsFormElements
            .admissionWard,
        admission.ward
    );

    setFormValue(
        admissionsFormElements
            .admissionRoom,
        admission.roomNumber
    );

    setFormValue(
        admissionsFormElements
            .admissionBed,
        admission.bedNumber
    );

    setFormValue(
        admissionsFormElements
            .admissionStatus,
        admission.status
    );

    setFormValue(
        admissionsFormElements
            .admissionNotes,
        admission.notes
    );

    admissionsFormElements
        .admissionModalLabel
        .textContent =
        "Edit Admission";

    admissionsFormElements
        .saveAdmissionText
        .textContent =
        "Update Admission";

    hideAdmissionAlert();

    bootstrap.Modal
        .getOrCreateInstance(
            admissionsFormElements
                .admissionModal
        )
        .show();
};

const collectAdmissionFormData = () => {
    const getValue = (id) =>
        admissionsFormElements[id]
            ?.value
            ?.trim() || "";

    return {
        admissionNumber:
            getValue("admissionNumber")
                .toUpperCase(),

        patient:
            getValue("admissionPatient"),

        attendingDoctor:
            getValue("admissionDoctor") ||
            null,

        department:
            getValue("admissionDepartment") ||
            null,

        admissionDate:
            getValue("admissionDate"),

        expectedDischargeDate:
            getValue(
                "expectedDischargeDate"
            ) || null,

        admissionType:
            getValue("admissionType"),

        priority:
            getValue("admissionPriority"),

        reason:
            getValue("admissionReason"),

        diagnosis:
            getValue("admissionDiagnosis"),

        symptoms:
            getValue("admissionSymptoms"),

        ward:
            getValue("admissionWard"),

        roomNumber:
            getValue("admissionRoom"),

        bedNumber:
            getValue("admissionBed"),

        status:
            getValue("admissionStatus"),

        notes:
            getValue("admissionNotes")
    };
};

const validateAdmissionForm = (
    payload
) => {
    if (!payload.admissionNumber) {
        return "Admission number is required.";
    }

    if (!payload.patient) {
        return "Please select a patient.";
    }

    if (!payload.admissionDate) {
        return "Admission date is required.";
    }

    if (!payload.reason) {
        return "Admission reason is required.";
    }

    if (
        payload.expectedDischargeDate &&
        new Date(
            payload.expectedDischargeDate
        ) <
            new Date(
                payload.admissionDate
            )
    ) {
        return (
            "Expected discharge date cannot be " +
            "before admission date."
        );
    }

    return null;
};

const setSaveLoading = (
    loading
) => {
    const button =
        admissionsFormElements
            .saveAdmissionBtn;

    if (!button) return;

    button.disabled = loading;

    admissionsFormElements
        .saveAdmissionSpinner
        ?.classList.toggle(
            "d-none",
            !loading
        );

    admissionsFormElements
        .saveAdmissionIcon
        ?.classList.toggle(
            "d-none",
            loading
        );
};

const saveAdmission = async () => {
    const payload =
        collectAdmissionFormData();

    const validationError =
        validateAdmissionForm(
            payload
        );

    if (validationError) {
        showAdmissionAlert(
            validationError,
            "danger"
        );

        return;
    }

    setSaveLoading(true);
    hideAdmissionAlert();

    try {
        const data =
            window.mediCoreAdmissionsData;

        if (
            admissionsFormState.mode ===
            "edit"
        ) {
            await data.updateAdmission(
                admissionsFormState
                    .editingId,
                payload
            );

            window.mediCoreAdmissionsUI
                .showToast(
                    "Admission updated successfully."
                );
        } else {
            await data.createAdmission(
                payload
            );

            window.mediCoreAdmissionsUI
                .showToast(
                    "Admission created successfully."
                );
        }

        bootstrap.Modal
            .getOrCreateInstance(
                admissionsFormElements
                    .admissionModal
            )
            .hide();

        if (
            typeof window
                .mediCoreAdmissionsRefresh ===
            "function"
        ) {
            await window
                .mediCoreAdmissionsRefresh();
        }
    } catch (error) {
        console.error(
            "Save admission error:",
            error
        );

        showAdmissionAlert(
            data.getErrorMessage(error),
            "danger"
        );
    } finally {
        setSaveLoading(false);
    }
};

const showAdmissionAlert = (
    message,
    type = "danger"
) => {
    const alert =
        admissionsFormElements
            .admissionFormAlert;

    if (!alert) return;

    alert.className =
        `alert alert-${type}`;

    alert.textContent = message;
    alert.classList.remove("d-none");
};

const hideAdmissionAlert = () => {
    const alert =
        admissionsFormElements
            .admissionFormAlert;

    if (!alert) return;

    alert.classList.add("d-none");
    alert.textContent = "";
};

const initAdmissionForm = () => {
    cacheAdmissionFormElements();

    resetAdmissionForm();

    admissionsFormElements
        .admissionForm
        ?.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();
                await saveAdmission();
            }
        );
};

window.mediCoreAdmissionsForm = {
    state: admissionsFormState,
    elements: admissionsFormElements,
    init: initAdmissionForm,
    reset: resetAdmissionForm,
    openCreate: openCreateAdmission,
    openEdit: openEditAdmission,
    loadLookups: loadAdmissionLookups,
    save: saveAdmission,
    collect: collectAdmissionFormData,
    validate: validateAdmissionForm,
    showAlert: showAdmissionAlert,
    hideAlert: hideAdmissionAlert
};