/* =========================================================
   MEDICORE — PRESCRIPTIONS FORM
   Phase 11
   Handles create/edit form, medicines, validation and save.
   ========================================================= */

(function () {
    "use strict";

    const data = window.mediCorePrescriptionData;
    const ui = window.mediCorePrescriptionUI;

    if (!data || !ui) {
        console.error(
            "MediCore Prescription Data/UI modules are required."
        );
        return;
    }

    const state = {
        editingId: null,
        patients: [],
        doctors: [],
        medicines: []
    };

    const elements = {
        modal: document.getElementById("prescriptionModal"),
        form: document.getElementById("prescriptionForm"),
        modalLabel: document.getElementById(
            "prescriptionModalLabel"
        ),

        patient: document.getElementById(
            "prescriptionPatient"
        ),

        doctor: document.getElementById(
            "prescriptionDoctor"
        ),

        date: document.getElementById(
            "prescriptionDate"
        ),

        diagnosis: document.getElementById(
            "prescriptionDiagnosis"
        ),

        instructions: document.getElementById(
            "prescriptionInstructions"
        ),

        refills: document.getElementById(
            "prescriptionRefills"
        ),

        notes: document.getElementById(
            "prescriptionNotes"
        ),

        medicineList: document.getElementById(
            "prescriptionMedicineList"
        ),

        addMedicineBtn: document.getElementById(
            "addMedicineBtn"
        ),

        saveBtn: document.getElementById(
            "savePrescriptionBtn"
        ),

        saveSpinner: document.getElementById(
            "savePrescriptionSpinner"
        ),

        saveIcon: document.getElementById(
            "savePrescriptionIcon"
        ),

        saveText: document.getElementById(
            "savePrescriptionText"
        ),

        formAlert: document.getElementById(
            "prescriptionFormAlert"
        ),

        medicinesError: document.getElementById(
            "prescriptionMedicinesError"
        )
    };

    /* =====================================================
       HELPERS
       ===================================================== */

    function getArrayFromResponse(response) {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.patients)) {
            return response.patients;
        }

        if (Array.isArray(response?.doctors)) {
            return response.doctors;
        }

        if (Array.isArray(response?.prescriptions)) {
            return response.prescriptions;
        }

        return [];
    }

    function getId(value) {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        return value._id || value.id || "";
    }

    function getPersonName(person) {
        if (!person) {
            return "";
        }

        if (typeof person === "string") {
            return person;
        }

        if (person.name) {
            return person.name;
        }

        return [
            person.firstName,
            person.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .trim();
    }

    function getToday() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function escapeHTML(value) {
        return ui.escapeHTML(value);
    }

    function showFormAlert(message) {
        if (!elements.formAlert) {
            return;
        }

        elements.formAlert.textContent = message;
        elements.formAlert.classList.remove("d-none");
    }

    function hideFormAlert() {
        if (!elements.formAlert) {
            return;
        }

        elements.formAlert.textContent = "";
        elements.formAlert.classList.add("d-none");
    }

    /* =====================================================
       PATIENT / DOCTOR OPTIONS
       ===================================================== */

    async function loadPatients() {
        try {
            const response = await data.getPatients({
                limit: 1000
            });

            state.patients = getArrayFromResponse(response);

            populatePatientSelect();
        } catch (error) {
            console.error(
                "Failed to load patients:",
                error
            );

            state.patients = [];

            populatePatientSelect();

            ui.showToast(
                "Patients could not be loaded.",
                "error"
            );
        }
    }

    async function loadDoctors() {
        try {
            const response = await data.getDoctors({
                limit: 1000
            });

            state.doctors = getArrayFromResponse(response);

            populateDoctorSelect();
        } catch (error) {
            console.error(
                "Failed to load doctors:",
                error
            );

            state.doctors = [];

            populateDoctorSelect();

            ui.showToast(
                "Doctors could not be loaded.",
                "error"
            );
        }
    }

    function populatePatientSelect(selectedId = "") {
        if (!elements.patient) {
            return;
        }

        const options = state.patients
            .map((patient) => {
                const id = getId(patient);
                const name =
                    getPersonName(patient) ||
                    "Unnamed patient";

                const mrn =
                    patient.patientId ||
                    patient.mrn ||
                    patient.medicalRecordNumber ||
                    "";

                return `
                    <option
                        value="${escapeHTML(id)}"
                        ${String(id) === String(selectedId) ? "selected" : ""}
                    >
                        ${escapeHTML(name)}
                        ${mrn ? ` — ${escapeHTML(mrn)}` : ""}
                    </option>
                `;
            })
            .join("");

        elements.patient.innerHTML = `
            <option value="">
                Select patient
            </option>
            ${options}
        `;
    }

    function populateDoctorSelect(selectedId = "") {
        if (!elements.doctor) {
            return;
        }

        const options = state.doctors
            .map((doctor) => {
                const id = getId(doctor);
                const name =
                    getPersonName(doctor) ||
                    "Unnamed doctor";

                const specialization =
                    doctor.specialization ||
                    doctor.specialty ||
                    "";

                return `
                    <option
                        value="${escapeHTML(id)}"
                        ${String(id) === String(selectedId) ? "selected" : ""}
                    >
                        ${escapeHTML(name)}
                        ${
                            specialization
                                ? ` — ${escapeHTML(specialization)}`
                                : ""
                        }
                    </option>
                `;
            })
            .join("");

        elements.doctor.innerHTML = `
            <option value="">
                Select doctor
            </option>
            ${options}
        `;
    }

    /* =====================================================
       MEDICINE ROWS
       ===================================================== */

    function createMedicineRow(medicine = {}) {
        const row = document.createElement("div");

        row.className =
            "prescription-medicine-row";

        row.dataset.medicineRow = "true";

        const name =
            medicine.name ||
            medicine.medicine ||
            medicine.medicineName ||
            "";

        const dosage =
            medicine.dosage ||
            medicine.dose ||
            "";

        const frequency =
            medicine.frequency ||
            "";

        const duration =
            medicine.duration ||
            "";

        row.innerHTML = `
            <div class="prescription-medicine-field">

                <label>
                    Medicine
                </label>

                <input
                    type="text"
                    class="form-control medicine-name"
                    value="${escapeHTML(name)}"
                    placeholder="Medicine name"
                    maxlength="150"
                >

            </div>

            <div class="prescription-medicine-field">

                <label>
                    Dosage
                </label>

                <input
                    type="text"
                    class="form-control medicine-dosage"
                    value="${escapeHTML(dosage)}"
                    placeholder="e.g. 500 mg"
                    maxlength="100"
                >

            </div>

            <div class="prescription-medicine-field">

                <label>
                    Frequency
                </label>

                <select class="form-select medicine-frequency">

                    <option value="">
                        Select frequency
                    </option>

                    <option
                        value="Once daily"
                        ${frequency === "Once daily" ? "selected" : ""}
                    >
                        Once daily
                    </option>

                    <option
                        value="Twice daily"
                        ${frequency === "Twice daily" ? "selected" : ""}
                    >
                        Twice daily
                    </option>

                    <option
                        value="Three times daily"
                        ${frequency === "Three times daily" ? "selected" : ""}
                    >
                        Three times daily
                    </option>

                    <option
                        value="Four times daily"
                        ${frequency === "Four times daily" ? "selected" : ""}
                    >
                        Four times daily
                    </option>

                    <option
                        value="Every 4 hours"
                        ${frequency === "Every 4 hours" ? "selected" : ""}
                    >
                        Every 4 hours
                    </option>

                    <option
                        value="Every 6 hours"
                        ${frequency === "Every 6 hours" ? "selected" : ""}
                    >
                        Every 6 hours
                    </option>

                    <option
                        value="Every 8 hours"
                        ${frequency === "Every 8 hours" ? "selected" : ""}
                    >
                        Every 8 hours
                    </option>

                    <option
                        value="As needed"
                        ${frequency === "As needed" ? "selected" : ""}
                    >
                        As needed
                    </option>

                </select>

            </div>

            <div class="prescription-medicine-field">

                <label>
                    Duration
                </label>

                <input
                    type="text"
                    class="form-control medicine-duration"
                    value="${escapeHTML(duration)}"
                    placeholder="e.g. 7 days"
                    maxlength="100"
                >

            </div>

            <button
                type="button"
                class="prescription-remove-medicine"
                title="Remove medicine"
                aria-label="Remove medicine"
            >
                <i class="bi bi-trash3"></i>
            </button>
        `;

        const removeButton =
            row.querySelector(
                ".prescription-remove-medicine"
            );

        removeButton.addEventListener(
            "click",
            () => {
                row.remove();

                if (
                    !elements.medicineList.children.length
                ) {
                    addMedicineRow();
                }

                updateMedicineError();
            }
        );

        return row;
    }

    function addMedicineRow(medicine = {}) {
        if (!elements.medicineList) {
            return;
        }

        const row =
            createMedicineRow(medicine);

        elements.medicineList.appendChild(row);

        updateMedicineEmptyState();
    }

    function updateMedicineEmptyState() {
        if (!elements.medicineList) {
            return;
        }

        const rows =
            elements.medicineList.querySelectorAll(
                "[data-medicine-row]"
            );

        const empty =
            elements.medicineList.querySelector(
                ".prescription-no-medicines"
            );

        if (rows.length === 0) {
            if (!empty) {
                elements.medicineList.innerHTML = `
                    <div class="prescription-no-medicines">
                        No medicines added yet.
                        Use "Add Medicine" to add one.
                    </div>
                `;
            }

            return;
        }

        empty?.remove();
    }

    function clearMedicineRows() {
        if (!elements.medicineList) {
            return;
        }

        elements.medicineList.innerHTML = "";

        state.medicines = [];
    }

    function collectMedicines() {
        if (!elements.medicineList) {
            return [];
        }

        const rows =
            elements.medicineList.querySelectorAll(
                "[data-medicine-row]"
            );

        return Array.from(rows)
            .map((row) => {
                const name =
                    row.querySelector(
                        ".medicine-name"
                    )?.value.trim() || "";

                const dosage =
                    row.querySelector(
                        ".medicine-dosage"
                    )?.value.trim() || "";

                const frequency =
                    row.querySelector(
                        ".medicine-frequency"
                    )?.value.trim() || "";

                const duration =
                    row.querySelector(
                        ".medicine-duration"
                    )?.value.trim() || "";

                return {
                    name,
                    dosage,
                    frequency,
                    duration
                };
            })
            .filter(
                (medicine) =>
                    medicine.name ||
                    medicine.dosage ||
                    medicine.frequency ||
                    medicine.duration
            );
    }

    function updateMedicineError() {
        if (!elements.medicinesError) {
            return;
        }

        const medicines =
            collectMedicines();

        if (!medicines.length) {
            elements.medicinesError.textContent =
                "Add at least one medicine.";
            return false;
        }

        elements.medicinesError.textContent = "";
        return true;
    }

    /* =====================================================
       VALIDATION
       ===================================================== */

    function clearValidation() {
        const fields = [
            elements.patient,
            elements.doctor,
            elements.date,
            elements.diagnosis
        ];

        fields.forEach((field) => {
            field?.classList.remove(
                "is-invalid"
            );
        });

        if (elements.medicinesError) {
            elements.medicinesError.textContent = "";
        }
    }

    function validateForm() {
        clearValidation();

        let valid = true;

        if (!elements.patient?.value) {
            elements.patient?.classList.add(
                "is-invalid"
            );

            valid = false;
        }

        if (!elements.doctor?.value) {
            elements.doctor?.classList.add(
                "is-invalid"
            );

            valid = false;
        }

        if (!elements.date?.value) {
            elements.date?.classList.add(
                "is-invalid"
            );

            valid = false;
        }

        if (!elements.diagnosis?.value.trim()) {
            elements.diagnosis?.classList.add(
                "is-invalid"
            );

            valid = false;
        }

        if (!updateMedicineError()) {
            valid = false;
        }

        if (!valid) {
            showFormAlert(
                "Please complete all required prescription fields."
            );
        }

        return valid;
    }

    /* =====================================================
       PAYLOAD
       ===================================================== */

    function buildPayload() {
        const medicines =
            collectMedicines();

        const payload = {
            patient: elements.patient?.value || "",
            doctor: elements.doctor?.value || "",
            date: elements.date?.value || "",
            diagnosis:
                elements.diagnosis?.value.trim() || "",
            medicines,
            instructions:
                elements.instructions?.value.trim() || "",
            refills: Number(
                elements.refills?.value || 0
            ),
            notes:
                elements.notes?.value.trim() || ""
        };

        return payload;
    }

    /* =====================================================
       FORM RESET
       ===================================================== */

    function resetForm() {
        state.editingId = null;
        state.medicines = [];

        elements.form?.reset();

        clearValidation();
        hideFormAlert();

        if (elements.date) {
            elements.date.value = getToday();
        }

        if (elements.refills) {
            elements.refills.value = "0";
        }

        clearMedicineRows();
        addMedicineRow();

        if (elements.modalLabel) {
            elements.modalLabel.innerHTML = `
                <i class="bi bi-file-medical"></i>
                New Prescription
            `;
        }

        setSaveLoading(false);
    }

    /* =====================================================
       EDIT MODE
       ===================================================== */

    function normalizePrescription(prescription) {
        return ui.normalizePrescription(
            prescription
        );
    }

    function getPrescriptionValue(
        prescription,
        ...keys
    ) {
        for (const key of keys) {
            if (
                prescription[key] !== undefined &&
                prescription[key] !== null
            ) {
                return prescription[key];
            }
        }

        return "";
    }

    function fillForm(prescription) {
        const normalized =
            normalizePrescription(
                prescription
            );

        state.editingId =
            normalized.id ||
            normalized._id ||
            null;

        const patientId =
            getId(normalized.patient);

        const doctorId =
            getId(normalized.doctor);

        populatePatientSelect(
            patientId ||
                normalized.patientId ||
                ""
        );

        populateDoctorSelect(
            doctorId ||
                normalized.doctorId ||
                ""
        );

        if (elements.date) {
            const dateValue =
                getPrescriptionValue(
                    normalized,
                    "date",
                    "prescriptionDate"
                );

            if (dateValue) {
                const date =
                    new Date(dateValue);

                if (
                    !Number.isNaN(
                        date.getTime()
                    )
                ) {
                    elements.date.value =
                        date
                            .toISOString()
                            .slice(0, 10);
                } else {
                    elements.date.value =
                        String(
                            dateValue
                        ).slice(0, 10);
                }
            } else {
                elements.date.value =
                    getToday();
            }
        }

        if (elements.diagnosis) {
            elements.diagnosis.value =
                getPrescriptionValue(
                    normalized,
                    "diagnosis"
                );
        }

        if (elements.instructions) {
            elements.instructions.value =
                getPrescriptionValue(
                    normalized,
                    "instructions"
                );
        }

        if (elements.refills) {
            elements.refills.value =
                getPrescriptionValue(
                    normalized,
                    "refills"
                ) || 0;
        }

        if (elements.notes) {
            elements.notes.value =
                getPrescriptionValue(
                    normalized,
                    "notes"
                );
        }

        clearMedicineRows();

        const medicines =
            Array.isArray(
                normalized.medicines
            )
                ? normalized.medicines
                : [];

        if (medicines.length) {
            medicines.forEach(
                (medicine) => {
                    addMedicineRow(
                        medicine
                    );
                }
            );
        } else {
            addMedicineRow();
        }

        if (elements.modalLabel) {
            elements.modalLabel.innerHTML = `
                <i class="bi bi-pencil-square"></i>
                Edit Prescription
            `;
        }

        clearValidation();
        hideFormAlert();
    }

    async function openEdit(id) {
        if (!id) {
            return;
        }

        try {
            const response =
                await data.getPrescription(
                    id
                );

            const prescription =
                response?.data ||
                response?.prescription ||
                response;

            fillForm(
                prescription
            );

            showModal();
        } catch (error) {
            console.error(
                "Failed to load prescription:",
                error
            );

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to load prescription."
                ),
                "error"
            );
        }
    }

    /* =====================================================
       MODAL
       ===================================================== */

    function showModal() {
        if (
            !elements.modal ||
            !window.bootstrap
        ) {
            return;
        }

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                elements.modal
            );

        modal.show();
    }

    function openCreate() {
        resetForm();

        if (
            !state.patients.length ||
            !state.doctors.length
        ) {
            Promise.all([
                state.patients.length
                    ? Promise.resolve()
                    : loadPatients(),

                state.doctors.length
                    ? Promise.resolve()
                    : loadDoctors()
            ]).then(() => {
                showModal();
            });

            return;
        }

        populatePatientSelect();
        populateDoctorSelect();

        showModal();
    }

    /* =====================================================
       SAVE
       ===================================================== */

    function setSaveLoading(loading) {
        if (!elements.saveBtn) {
            return;
        }

        elements.saveBtn.disabled =
            loading;

        elements.saveSpinner?.classList.toggle(
            "d-none",
            !loading
        );

        elements.saveIcon?.classList.toggle(
            "d-none",
            loading
        );

        if (elements.saveText) {
            elements.saveText.textContent =
                loading
                    ? "Saving..."
                    : state.editingId
                        ? "Update Prescription"
                        : "Save Prescription";
        }
    }

    async function save() {
        hideFormAlert();

        if (!validateForm()) {
            return;
        }

        const payload =
            buildPayload();

        setSaveLoading(true);

        try {
            let response;

            if (state.editingId) {
                response =
                    await data.updatePrescription(
                        state.editingId,
                        payload
                    );
            } else {
                response =
                    await data.createPrescription(
                        payload
                    );
            }

            const message =
                response?.message ||
                (
                    state.editingId
                        ? "Prescription updated successfully."
                        : "Prescription created successfully."
                );

            ui.showToast(
                message,
                "success"
            );

            closeModal();

            window.dispatchEvent(
                new CustomEvent(
                    "medicore:prescription:saved",
                    {
                        detail: {
                            response,
                            editing:
                                Boolean(
                                    state.editingId
                                )
                        }
                    }
                )
            );
        } catch (error) {
            console.error(
                "Failed to save prescription:",
                error
            );

            const message =
                getErrorMessage(
                    error,
                    "Unable to save prescription."
                );

            showFormAlert(message);

            ui.showToast(
                message,
                "error"
            );
        } finally {
            setSaveLoading(false);
        }
    }

    /* =====================================================
       CLOSE
       ===================================================== */

    function closeModal() {
        if (
            elements.modal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getInstance(
                    elements.modal
                );

            modal?.hide();
        }
    }

    /* =====================================================
       ERROR HANDLING
       ===================================================== */

    function getErrorMessage(
        error,
        fallback
    ) {
        return (
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            fallback
        );
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {
        elements.addMedicineBtn?.addEventListener(
            "click",
            () => {
                addMedicineRow();
            }
        );

        elements.saveBtn?.addEventListener(
            "click",
            save
        );

        elements.form?.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();
                save();
            }
        );

        [
            elements.patient,
            elements.doctor,
            elements.date,
            elements.diagnosis
        ].forEach((field) => {
            field?.addEventListener(
                "input",
                () => {
                    field.classList.remove(
                        "is-invalid"
                    );

                    hideFormAlert();
                }
            );

            field?.addEventListener(
                "change",
                () => {
                    field.classList.remove(
                        "is-invalid"
                    );

                    hideFormAlert();
                }
            );
        });

        elements.form?.addEventListener(
            "input",
            (event) => {
                if (
                    event.target.closest(
                        ".prescription-medicine-row"
                    )
                ) {
                    updateMedicineError();
                }
            }
        );

        elements.modal?.addEventListener(
            "hidden.bs.modal",
            () => {
                resetForm();
            }
        );

        window.addEventListener(
            "medicore:prescription:edit",
            (event) => {
                const id =
                    event.detail?.id;

                if (id) {
                    openEdit(id);
                }
            }
        );

        window.addEventListener(
            "medicore:prescription:create",
            () => {
                openCreate();
            }
        );
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function init() {
        bindEvents();

        resetForm();

        /*
         * Load dropdown data once when the module initializes.
         * The API may reject these calls while authentication
         * is being repaired; the page remains usable and the
         * user can retry by opening the form later.
         */
        await Promise.allSettled([
            loadPatients(),
            loadDoctors()
        ]);
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.mediCorePrescriptionForm = {
        state,

        init,
        openCreate,
        openEdit,

        loadPatients,
        loadDoctors,

        addMedicineRow,
        collectMedicines,

        validateForm,
        buildPayload,

        resetForm,
        closeModal
    };

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();