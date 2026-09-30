// =========================================================
// MEDICORE — MEDICAL RECORDS FORM
// Phase 10
// =========================================================

let formElements = {};
let formCallbacks = {};
let currentRecordId = null;
let currentMode = "create";


// =========================================================
// INITIALIZE FORM
// =========================================================

function initMedicalRecordForm(
    elements = {},
    callbacks = {}
) {
    formElements = elements;
    formCallbacks = callbacks;

    currentRecordId = null;
    currentMode = "create";

    bindFormEvents();

    resetMedicalRecordForm();
}


// =========================================================
// FORM EVENTS
// =========================================================

function bindFormEvents() {
    const form =
        formElements.form;

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleFormSubmit
    );

    const cancelButton =
        formElements.cancelButton;

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            handleCancel
        );
    }

    const modalElement =
        formElements.modalElement;

    if (modalElement) {
        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {
                resetMedicalRecordForm();
            }
        );
    }
}


// =========================================================
// SUBMIT
// =========================================================

async function handleFormSubmit(event) {
    event.preventDefault();

    clearValidationErrors();

    const formData =
        collectFormData();

    const validation =
        validateMedicalRecordForm(
            formData
        );

    if (!validation.valid) {
        showValidationErrors(
            validation.errors
        );

        return;
    }

    setFormSubmitting(true);

    try {
        if (currentMode === "edit") {
            if (
                typeof formCallbacks.onUpdate ===
                "function"
            ) {
                await formCallbacks.onUpdate(
                    currentRecordId,
                    formData
                );
            }
        } else {
            if (
                typeof formCallbacks.onCreate ===
                "function"
            ) {
                await formCallbacks.onCreate(
                    formData
                );
            }
        }

    } catch (error) {
        console.error(
            "Medical record form submission error:",
            error
        );

        if (
            typeof formCallbacks.onError ===
            "function"
        ) {
            formCallbacks.onError(error);
        }

    } finally {
        setFormSubmitting(false);
    }
}


// =========================================================
// COLLECT FORM DATA
// =========================================================

function collectFormData() {
    const patient =
        formElements.patient?.value?.trim() || "";

    const doctor =
        formElements.doctor?.value?.trim() || "";

    const recordDate =
        formElements.recordDate?.value?.trim() || "";

    const chiefComplaint =
        formElements.chiefComplaint?.value?.trim() || "";

    const symptoms =
        formElements.symptoms?.value?.trim() || "";

    const diagnosis =
        formElements.diagnosis?.value?.trim() || "";

    const treatmentPlan =
        formElements.treatmentPlan?.value?.trim() || "";

    const notes =
        formElements.notes?.value?.trim() || "";

    return {
        patient,
        doctor,
        recordDate,
        chiefComplaint,
        symptoms,
        diagnosis,
        treatmentPlan,
        notes
    };
}


// =========================================================
// VALIDATION
// =========================================================

function validateMedicalRecordForm(data) {
    const errors = {};

    if (!data.patient) {
        errors.patient =
            "Please select a patient.";
    }

    if (!data.doctor) {
        errors.doctor =
            "Please select a doctor.";
    }

    if (!data.recordDate) {
        errors.recordDate =
            "Please select the record date and time.";
    }

    if (data.recordDate) {
        const selectedDate =
            new Date(data.recordDate);

        if (
            Number.isNaN(
                selectedDate.getTime()
            )
        ) {
            errors.recordDate =
                "Please enter a valid date and time.";
        }
    }

    if (
        data.chiefComplaint.length > 500
    ) {
        errors.chiefComplaint =
            "Chief complaint cannot exceed 500 characters.";
    }

    if (
        data.symptoms.length > 2000
    ) {
        errors.symptoms =
            "Symptoms cannot exceed 2,000 characters.";
    }

    if (
        data.diagnosis.length > 2000
    ) {
        errors.diagnosis =
            "Diagnosis cannot exceed 2,000 characters.";
    }

    if (
        data.treatmentPlan.length > 2000
    ) {
        errors.treatmentPlan =
            "Treatment plan cannot exceed 2,000 characters.";
    }

    if (
        data.notes.length > 3000
    ) {
        errors.notes =
            "Clinical notes cannot exceed 3,000 characters.";
    }

    return {
        valid:
            Object.keys(errors).length === 0,
        errors
    };
}


// =========================================================
// SHOW VALIDATION ERRORS
// =========================================================

function showValidationErrors(errors = {}) {
    Object.entries(errors).forEach(
        ([field, message]) => {
            const element =
                formElements[field];

            if (!element) {
                return;
            }

            element.classList.add(
                "is-invalid"
            );

            const feedback =
                getValidationFeedbackElement(
                    element
                );

            if (feedback) {
                feedback.textContent =
                    message;
            }
        }
    );

    const firstError =
        Object.keys(errors)[0];

    if (firstError) {
        const element =
            formElements[firstError];

        if (element) {
            element.focus();
        }
    }
}


// =========================================================
// CLEAR VALIDATION
// =========================================================

function clearValidationErrors() {
    Object.values(formElements).forEach(
        (element) => {
            if (
                !element ||
                !element.classList
            ) {
                return;
            }

            element.classList.remove(
                "is-invalid"
            );
        }
    );

    const feedbackElements =
        document.querySelectorAll(
            ".medical-record-form .invalid-feedback"
        );

    feedbackElements.forEach(
        (feedback) => {
            feedback.textContent = "";
        }
    );
}


// =========================================================
// VALIDATION FEEDBACK
// =========================================================

function getValidationFeedbackElement(
    input
) {
    if (!input) {
        return null;
    }

    const parent =
        input.parentElement;

    if (!parent) {
        return null;
    }

    let feedback =
        parent.querySelector(
            ".invalid-feedback"
        );

    if (!feedback) {
        feedback =
            document.createElement(
                "div"
            );

        feedback.className =
            "invalid-feedback";

        parent.appendChild(
            feedback
        );
    }

    return feedback;
}


// =========================================================
// RESET FORM
// =========================================================

function resetMedicalRecordForm() {
    currentRecordId = null;
    currentMode = "create";

    const form =
        formElements.form;

    if (form) {
        form.reset();
    }

    setDefaultRecordDate();

    clearValidationErrors();

    updateFormMode();

    setFormSubmitting(false);
}


// =========================================================
// DEFAULT DATE
// =========================================================

function setDefaultRecordDate() {
    const input =
        formElements.recordDate;

    if (!input) {
        return;
    }

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    input.value =
        `${year}-${month}-${day}T${hours}:${minutes}`;
}


// =========================================================
// OPEN CREATE MODE
// =========================================================

function openCreateMedicalRecord() {
    currentRecordId = null;
    currentMode = "create";

    resetMedicalRecordForm();

    updateFormMode();

    showFormModal();
}


// =========================================================
// OPEN EDIT MODE
// =========================================================

function openEditMedicalRecord(record) {
    if (!record) {
        return;
    }

    currentRecordId =
        record._id || null;

    currentMode = "edit";

    populateForm(record);

    clearValidationErrors();

    updateFormMode();

    showFormModal();
}


// =========================================================
// POPULATE FORM
// =========================================================

function populateForm(record) {
    if (!record) {
        return;
    }

    if (formElements.patient) {
        formElements.patient.value =
            record.patient?._id ||
            record.patient ||
            "";
    }

    if (formElements.doctor) {
        formElements.doctor.value =
            record.doctor?._id ||
            record.doctor ||
            "";
    }

    if (formElements.recordDate) {
        formElements.recordDate.value =
            convertToDateTimeLocal(
                record.recordDate
            );
    }

    if (formElements.chiefComplaint) {
        formElements.chiefComplaint.value =
            record.chiefComplaint || "";
    }

    if (formElements.symptoms) {
        formElements.symptoms.value =
            record.symptoms || "";
    }

    if (formElements.diagnosis) {
        formElements.diagnosis.value =
            record.diagnosis || "";
    }

    if (formElements.treatmentPlan) {
        formElements.treatmentPlan.value =
            record.treatmentPlan || "";
    }

    if (formElements.notes) {
        formElements.notes.value =
            record.notes || "";
    }
}


// =========================================================
// DATE CONVERSION
// =========================================================

function convertToDateTimeLocal(
    dateValue
) {
    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


// =========================================================
// FORM MODE UI
// =========================================================

function updateFormMode() {
    const title =
        formElements.modalTitle;

    const submitButton =
        formElements.submitButton;

    if (currentMode === "edit") {
        if (title) {
            title.textContent =
                "Edit Medical Record";
        }

        if (submitButton) {
            submitButton.innerHTML = `
                <i class="bi bi-check2-circle me-1"></i>
                Update Record
            `;
        }
    } else {
        if (title) {
            title.textContent =
                "Add Medical Record";
        }

        if (submitButton) {
            submitButton.innerHTML = `
                <i class="bi bi-check2-circle me-1"></i>
                Save Record
            `;
        }
    }
}


// =========================================================
// SHOW MODAL
// =========================================================

function showFormModal() {
    const modalElement =
        formElements.modalElement;

    if (!modalElement) {
        return;
    }

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();
}


// =========================================================
// HIDE MODAL
// =========================================================

function hideFormModal() {
    const modalElement =
        formElements.modalElement;

    if (!modalElement) {
        return;
    }

    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    if (modal) {
        modal.hide();
    }
}


// =========================================================
// CANCEL
// =========================================================

function handleCancel() {
    hideFormModal();
}


// =========================================================
// SUBMITTING STATE
// =========================================================

function setFormSubmitting(
    isSubmitting
) {
    const submitButton =
        formElements.submitButton;

    const cancelButton =
        formElements.cancelButton;

    if (submitButton) {
        submitButton.disabled =
            isSubmitting;

        if (isSubmitting) {
            submitButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                ></span>
                Saving...
            `;
        } else {
            updateFormMode();
        }
    }

    if (cancelButton) {
        cancelButton.disabled =
            isSubmitting;
    }
}


// =========================================================
// GET CURRENT RECORD ID
// =========================================================

function getCurrentMedicalRecordId() {
    return currentRecordId;
}


// =========================================================
// GET CURRENT MODE
// =========================================================

function getMedicalRecordFormMode() {
    return currentMode;
}


// =========================================================
// EXPORTS
// =========================================================

export {
    initMedicalRecordForm,
    resetMedicalRecordForm,
    openCreateMedicalRecord,
    openEditMedicalRecord,
    populateForm,
    validateMedicalRecordForm,
    collectFormData,
    hideFormModal,
    getCurrentMedicalRecordId,
    getMedicalRecordFormMode
};