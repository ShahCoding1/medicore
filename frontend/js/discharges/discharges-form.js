let dischargeFormSubmitting = false;

function resetDischargeForm() {
    const form = document.getElementById("dischargeForm");

    if (!form) {
        return;
    }

    form.reset();

    const dischargeDate = document.getElementById("dischargeDate");

    if (dischargeDate) {
        dischargeDate.value = new Date()
            .toISOString()
            .split("T")[0];
    }

    hideDischargeFormAlert();

    dischargesData.editingId = null;

    const modalLabel = document.getElementById(
        "dischargeModalLabel"
    );

    if (modalLabel) {
        modalLabel.textContent = "Create Discharge Record";
    }

    setDischargeSaveLoading(false);

    populateDischargePatientOptions();
    populateDischargeDoctorOptions();
    populateDischargeAdmissionOptions();
}

function prepareNewDischarge() {
    resetDischargeForm();

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const dischargeDate = document.getElementById(
        "dischargeDate"
    );

    if (dischargeDate) {
        dischargeDate.value = today;
    }

    openDischargeModal();
}

function populateDischargeForm(discharge) {
    if (!discharge) {
        return;
    }

    const patientId =
        discharge.patient?._id ||
        discharge.patient ||
        "";

    const admissionId =
        discharge.admission?._id ||
        discharge.admission ||
        "";

    const doctorId =
        discharge.doctor?._id ||
        discharge.doctor ||
        "";

    const setValue = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }
    };

    setValue("dischargePatient", patientId);
    setValue("dischargeDoctor", doctorId);

    populateDischargeAdmissionOptions(patientId);

    setValue("dischargeAdmission", admissionId);

    setValue(
        "dischargeAdmissionDate",
        discharge.admissionDate
            ? new Date(discharge.admissionDate)
                .toISOString()
                .split("T")[0]
            : ""
    );

    setValue(
        "dischargeDate",
        discharge.dischargeDate
            ? new Date(discharge.dischargeDate)
                .toISOString()
                .split("T")[0]
            : ""
    );

    setValue(
        "dischargeDiagnosis",
        discharge.diagnosis
    );

    setValue(
        "dischargeTreatment",
        discharge.treatment
    );

    setValue(
        "dischargeProcedures",
        discharge.procedures
    );

    setValue(
        "dischargeMedication",
        discharge.medication
    );

    setValue(
        "dischargeCondition",
        discharge.condition
    );

    setValue(
        "dischargeFollowUp",
        discharge.followUp
    );

    setValue(
        "dischargeInstructions",
        discharge.instructions
    );

    setValue(
        "dischargeSummary",
        discharge.dischargeSummary
    );
}

async function prepareEditDischarge(id) {
    try {
        hideDischargeFormAlert();

        const discharge = await getDischargeById(id);

        if (!discharge) {
            throw new Error(
                "Discharge record could not be found."
            );
        }

        dischargesData.editingId = id;

        const modalLabel = document.getElementById(
            "dischargeModalLabel"
        );

        if (modalLabel) {
            modalLabel.textContent = "Edit Discharge Record";
        }

        populateDischargeForm(discharge);

        setDischargeSaveLoading(false);

        openDischargeModal();
    } catch (error) {
        console.error(
            "Failed to load discharge record:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to load the discharge record."
            ),
            "danger"
        );
    }
}

function collectDischargeFormData() {
    const getValue = (id) => {
        const element = document.getElementById(id);

        return element
            ? element.value.trim()
            : "";
    };

    return {
        patient: getValue("dischargePatient"),
        admission: getValue("dischargeAdmission"),
        doctor: getValue("dischargeDoctor") || undefined,
        admissionDate: getValue(
            "dischargeAdmissionDate"
        ),
        dischargeDate: getValue("dischargeDate"),
        diagnosis: getValue("dischargeDiagnosis"),
        treatment: getValue("dischargeTreatment"),
        procedures: getValue("dischargeProcedures"),
        medication: getValue("dischargeMedication"),
        condition: getValue("dischargeCondition"),
        followUp: getValue("dischargeFollowUp"),
        instructions: getValue("dischargeInstructions"),
        dischargeSummary: getValue("dischargeSummary")
    };
}

function validateDischargeForm(payload) {
    if (!payload.patient) {
        return "Please select a patient.";
    }

    if (!payload.admission) {
        return "Please select an admission.";
    }

    if (!payload.admissionDate) {
        return "Please provide the admission date.";
    }

    if (!payload.dischargeDate) {
        return "Please provide the discharge date.";
    }

    const admissionDate = new Date(
        payload.admissionDate
    );

    const dischargeDate = new Date(
        payload.dischargeDate
    );

    if (
        Number.isNaN(admissionDate.getTime()) ||
        Number.isNaN(dischargeDate.getTime())
    ) {
        return "Please provide valid admission and discharge dates.";
    }

    if (dischargeDate < admissionDate) {
        return "Discharge date cannot be before the admission date.";
    }

    return null;
}

function getDischargeErrorMessage(
    error,
    fallback = "Something went wrong."
) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
}

async function handleDischargeFormSubmit(event) {
    event.preventDefault();

    if (dischargeFormSubmitting) {
        return;
    }

    hideDischargeFormAlert();

    const payload = collectDischargeFormData();

    const validationMessage =
        validateDischargeForm(payload);

    if (validationMessage) {
        showDischargeFormAlert(validationMessage);
        return;
    }

    dischargeFormSubmitting = true;

    setDischargeSaveLoading(true);

    try {
        if (dischargesData.editingId) {
            await updateDischarge(
                dischargesData.editingId,
                payload
            );

            showDischargeToast(
                "Discharge record updated successfully.",
                "success"
            );
        } else {
            await createDischarge(payload);

            showDischargeToast(
                "Discharge record created successfully.",
                "success"
            );
        }

        closeDischargeModal();

        await refreshDischargeData();

        renderDischargeSummary();
        renderDischargesTable();

        resetDischargeForm();
    } catch (error) {
        console.error(
            "Failed to save discharge record:",
            error
        );

        showDischargeFormAlert(
            getDischargeErrorMessage(
                error,
                "Unable to save the discharge record."
            )
        );
    } finally {
        dischargeFormSubmitting = false;
        setDischargeSaveLoading(false);
    }
}

async function handleDeleteDischarge(id) {
    if (!id) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete this discharge record? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {
        await deleteDischarge(id);

        showDischargeToast(
            "Discharge record deleted successfully.",
            "success"
        );

        await refreshDischargeData();

        renderDischargeSummary();
        renderDischargesTable();
    } catch (error) {
        console.error(
            "Failed to delete discharge record:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to delete the discharge record."
            ),
            "danger"
        );
    }
}

async function handleViewDischarge(id) {
    if (!id) {
        return;
    }

    try {
        const discharge = await getDischargeById(id);

        if (!discharge) {
            throw new Error(
                "Discharge record could not be found."
            );
        }

        const subtitle = document.getElementById(
            "viewDischargeSubtitle"
        );

        if (subtitle) {
            subtitle.textContent =
                `${getDischargePatientName(discharge)} · ${formatDischargeDate(
                    discharge.dischargeDate
                )}`;
        }

        renderDischargeDetails(discharge);

        openViewDischargeModal();
    } catch (error) {
        console.error(
            "Failed to view discharge record:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to load the discharge record."
            ),
            "danger"
        );
    }
}

function bindDischargeFormEvents() {
    const form = document.getElementById(
        "dischargeForm"
    );

    if (form) {
        form.addEventListener(
            "submit",
            handleDischargeFormSubmit
        );
    }

    const patientSelect = document.getElementById(
        "dischargePatient"
    );

    if (patientSelect) {
        patientSelect.addEventListener("change", () => {
            populateDischargeAdmissionOptions(
                patientSelect.value
            );

            const admissionSelect =
                document.getElementById(
                    "dischargeAdmission"
                );

            if (admissionSelect) {
                admissionSelect.value = "";
            }

            const admissionDateInput =
                document.getElementById(
                    "dischargeAdmissionDate"
                );

            if (admissionDateInput) {
                admissionDateInput.value = "";
            }
        });
    }

    const admissionSelect = document.getElementById(
        "dischargeAdmission"
    );

    if (admissionSelect) {
        admissionSelect.addEventListener(
            "change",
            syncDischargeAdmissionFields
        );
    }

    const addButton = document.getElementById(
        "addDischargeBtn"
    );

    if (addButton) {
        addButton.addEventListener(
            "click",
            prepareNewDischarge
        );
    }

    const emptyCreateButton = document.getElementById(
        "emptyCreateDischargeBtn"
    );

    if (emptyCreateButton) {
        emptyCreateButton.addEventListener(
            "click",
            prepareNewDischarge
        );
    }

    const modalElement =
        document.getElementById("dischargeModal");

    if (modalElement) {
        modalElement.addEventListener(
            "hidden.bs.modal",
            () => {
                if (!dischargeFormSubmitting) {
                    resetDischargeForm();
                }
            }
        );
    }
}

window.resetDischargeForm = resetDischargeForm;
window.prepareNewDischarge = prepareNewDischarge;
window.prepareEditDischarge = prepareEditDischarge;
window.collectDischargeFormData =
    collectDischargeFormData;
window.validateDischargeForm =
    validateDischargeForm;
window.handleDischargeFormSubmit =
    handleDischargeFormSubmit;
window.handleDeleteDischarge =
    handleDeleteDischarge;
window.handleViewDischarge =
    handleViewDischarge;
window.bindDischargeFormEvents =
    bindDischargeFormEvents;