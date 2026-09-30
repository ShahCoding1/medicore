// ============================================================================
// MEDICORE — MEDICAL RECORDS PAGE CONTROLLER
// Phase 10 — Medical Records
// Maintained by M Shah Khalid
// ============================================================================
//
// PURPOSE
// -------
// This is the main page controller for:
//     frontend/pages/medical-records.html
//
// RESPONSIBILITIES
// ----------------
// 1. Initialize the Medical Records page.
// 2. Connect the HTML to the modular data/UI/form modules.
// 3. Load patients and doctors.
// 4. Load medical records from the Express API.
// 5. Manage search and filters.
// 6. Handle Add / View / Edit / Delete.
// 7. Manage Bootstrap modals.
// 8. Display loading, error and success states.
// 9. Keep page state organized inside one class.
//
// ARCHITECTURE
// ------------
// medical-records.js
//      │
//      ├── medical-records-data.js
//      │      └── API / Axios operations
//      │
//      ├── medical-records-ui.js
//      │      └── Table rendering / dropdown rendering / actions
//      │
//      └── medical-records-form.js
//             └── Add/Edit form and validation
//
// IMPORTANT
// ---------
// This file does NOT contain:
// - Express routes
// - MongoDB queries
// - Mongoose models
// - Large HTML templates
// - CSS
//
// ============================================================================

import {
    getMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getPatients,
    getDoctors
} from "./medical-records-data.js";

import {
    renderMedicalRecords,
    renderMedicalRecordsLoading,
    renderMedicalRecordsError,
    populatePatientSelect,
    populateDoctorSelect,
    renderMedicalRecordDetails,
    bindMedicalRecordActions
} from "./medical-records-ui.js";

import {
    initMedicalRecordForm,
    openCreateMedicalRecord,
    openEditMedicalRecord
} from "./medical-records-form.js";


// ============================================================================
// MEDICAL RECORDS CONTROLLER CLASS
// ============================================================================

class MedicalRecordsController {

    constructor() {

        // --------------------------------------------------------------------
        // Central page state
        // --------------------------------------------------------------------

        this.state = {
            records: [],
            patients: [],
            doctors: [],

            filters: {
                search: "",
                patient: "",
                doctor: "",
                date: ""
            },

            isLoadingRecords: false,
            isLoadingReferenceData: false,

            editingRecordId: null,

            searchTimer: null,

            initialized: false
        };


        // --------------------------------------------------------------------
        // All DOM references are stored here.
        // --------------------------------------------------------------------

        this.elements = {};
    }


    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    async init() {

        // Prevent accidental double initialization.
        if (this.state.initialized) {
            return;
        }

        this.state.initialized = true;


        try {

            this.cacheElements();

            this.validateElements();

            this.bindPageEvents();

            this.initializeForm();

            this.initializeTableActions();

            await this.loadReferenceData();

            await this.loadMedicalRecords();

            console.info(
                "[MediCore] Medical Records initialized successfully."
            );

        } catch (error) {

            console.error(
                "[MediCore] Medical Records initialization failed:",
                error
            );

            this.handleInitializationError(error);
        }
    }


    // ========================================================================
    // DOM ELEMENTS
    // ========================================================================

    cacheElements() {

        // --------------------------------------------------------------------
        // Table
        // --------------------------------------------------------------------

        this.elements.recordsTableBody =
            document.getElementById(
                "medicalRecordsTableBody"
            );

        this.elements.recordsCount =
            document.getElementById(
                "medicalRecordsCount"
            );


        // --------------------------------------------------------------------
        // Search + filters
        // --------------------------------------------------------------------

        this.elements.searchInput =
            document.getElementById(
                "medicalRecordSearch"
            );

        this.elements.patientFilter =
            document.getElementById(
                "medicalRecordPatientFilter"
            );

        this.elements.doctorFilter =
            document.getElementById(
                "medicalRecordDoctorFilter"
            );

        this.elements.dateFilter =
            document.getElementById(
                "medicalRecordDateFilter"
            );

        this.elements.clearFiltersButton =
            document.getElementById(
                "clearMedicalRecordFilters"
            );


        // --------------------------------------------------------------------
        // Page action
        // --------------------------------------------------------------------

        this.elements.addButton =
            document.getElementById(
                "addMedicalRecordBtn"
            );


        // --------------------------------------------------------------------
        // Add/Edit modal
        // --------------------------------------------------------------------

        this.elements.form =
            document.getElementById(
                "medicalRecordForm"
            );

        this.elements.formModal =
            document.getElementById(
                "medicalRecordModal"
            );

        this.elements.formModalTitle =
            document.getElementById(
                "medicalRecordModalLabel"
            );

        this.elements.formSubmitButton =
            document.getElementById(
                "saveMedicalRecordBtn"
            );

        this.elements.formCancelButton =
            document.getElementById(
                "cancelMedicalRecordBtn"
            );


        // --------------------------------------------------------------------
        // Form fields
        // --------------------------------------------------------------------

        this.elements.formPatient =
            document.getElementById(
                "medicalRecordPatient"
            );

        this.elements.formDoctor =
            document.getElementById(
                "medicalRecordDoctor"
            );

        this.elements.formRecordDate =
            document.getElementById(
                "medicalRecordDate"
            );

        this.elements.formChiefComplaint =
            document.getElementById(
                "medicalRecordChiefComplaint"
            );

        this.elements.formSymptoms =
            document.getElementById(
                "medicalRecordSymptoms"
            );

        this.elements.formDiagnosis =
            document.getElementById(
                "medicalRecordDiagnosis"
            );

        this.elements.formTreatmentPlan =
            document.getElementById(
                "medicalRecordTreatmentPlan"
            );

        this.elements.formNotes =
            document.getElementById(
                "medicalRecordNotes"
            );


        // --------------------------------------------------------------------
        // View modal
        // --------------------------------------------------------------------

        this.elements.viewModal =
            document.getElementById(
                "viewMedicalRecordModal"
            );

        this.elements.viewContainer =
            document.getElementById(
                "medicalRecordDetails"
            );


        // --------------------------------------------------------------------
        // Toast container
        // --------------------------------------------------------------------

        this.elements.toastContainer =
            document.getElementById(
                "medicalRecordToastContainer"
            );
    }


    // ========================================================================
    // DOM VALIDATION
    // ========================================================================

    validateElements() {

        const required = {

            recordsTableBody:
                this.elements.recordsTableBody,

            recordsCount:
                this.elements.recordsCount,

            searchInput:
                this.elements.searchInput,

            patientFilter:
                this.elements.patientFilter,

            doctorFilter:
                this.elements.doctorFilter,

            dateFilter:
                this.elements.dateFilter,

            clearFiltersButton:
                this.elements.clearFiltersButton,

            addButton:
                this.elements.addButton,

            form:
                this.elements.form,

            formModal:
                this.elements.formModal,

            formModalTitle:
                this.elements.formModalTitle,

            formSubmitButton:
                this.elements.formSubmitButton,

            formPatient:
                this.elements.formPatient,

            formDoctor:
                this.elements.formDoctor,

            formRecordDate:
                this.elements.formRecordDate,

            formChiefComplaint:
                this.elements.formChiefComplaint,

            formSymptoms:
                this.elements.formSymptoms,

            formDiagnosis:
                this.elements.formDiagnosis,

            formTreatmentPlan:
                this.elements.formTreatmentPlan,

            formNotes:
                this.elements.formNotes,

            viewModal:
                this.elements.viewModal,

            viewContainer:
                this.elements.viewContainer,

            toastContainer:
                this.elements.toastContainer
        };


        const missing =
            Object.entries(required)
                .filter(
                    ([, element]) => !element
                )
                .map(
                    ([name]) => name
                );


        if (missing.length > 0) {

            throw new Error(
                `Missing Medical Records HTML elements: ${missing.join(", ")}`
            );
        }
    }


    // ========================================================================
    // PAGE EVENTS
    // ========================================================================

    bindPageEvents() {

        // --------------------------------------------------------------------
        // Search
        // --------------------------------------------------------------------

        this.elements.searchInput.addEventListener(
            "input",
            (event) => {

                this.state.filters.search =
                    event.target.value.trim();

                this.debounceSearch();
            }
        );


        // --------------------------------------------------------------------
        // Patient filter
        // --------------------------------------------------------------------

        this.elements.patientFilter.addEventListener(
            "change",
            (event) => {

                this.state.filters.patient =
                    event.target.value;

                this.loadMedicalRecords();
            }
        );


        // --------------------------------------------------------------------
        // Doctor filter
        // --------------------------------------------------------------------

        this.elements.doctorFilter.addEventListener(
            "change",
            (event) => {

                this.state.filters.doctor =
                    event.target.value;

                this.loadMedicalRecords();
            }
        );


        // --------------------------------------------------------------------
        // Date filter
        // --------------------------------------------------------------------

        this.elements.dateFilter.addEventListener(
            "change",
            (event) => {

                this.state.filters.date =
                    event.target.value;

                this.loadMedicalRecords();
            }
        );


        // --------------------------------------------------------------------
        // Clear
        // --------------------------------------------------------------------

        this.elements.clearFiltersButton.addEventListener(
            "click",
            () => {
                this.clearFilters();
            }
        );


        // --------------------------------------------------------------------
        // Add Medical Record
        // --------------------------------------------------------------------

        this.elements.addButton.addEventListener(
            "click",
            () => {
                this.handleCreateButton();
            }
        );


        // --------------------------------------------------------------------
        // Save button
        //
        // The current HTML has historically used type="button".
        // requestSubmit() safely sends the form through the form module's
        // normal submit/validation flow.
        // --------------------------------------------------------------------

        this.elements.formSubmitButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                if (
                    typeof this.elements.form.requestSubmit ===
                    "function"
                ) {

                    this.elements.form.requestSubmit();

                } else {

                    this.elements.form.dispatchEvent(
                        new Event(
                            "submit",
                            {
                                bubbles: true,
                                cancelable: true
                            }
                        )
                    );
                }
            }
        );
    }


    // ========================================================================
    // FORM INITIALIZATION
    // ========================================================================

    initializeForm() {

        initMedicalRecordForm(

            {
                form:
                    this.elements.form,

                modalElement:
                    this.elements.formModal,

                modalTitle:
                    this.elements.formModalTitle,

                submitButton:
                    this.elements.formSubmitButton,

                cancelButton:
                    this.elements.formCancelButton,

                patient:
                    this.elements.formPatient,

                doctor:
                    this.elements.formDoctor,

                recordDate:
                    this.elements.formRecordDate,

                chiefComplaint:
                    this.elements.formChiefComplaint,

                symptoms:
                    this.elements.formSymptoms,

                diagnosis:
                    this.elements.formDiagnosis,

                treatmentPlan:
                    this.elements.formTreatmentPlan,

                notes:
                    this.elements.formNotes
            },

            {
                onCreate:
                    (formData) => {
                        return this.handleCreateRecord(
                            formData
                        );
                    },

                onUpdate:
                    (recordId, formData) => {
                        return this.handleUpdateRecord(
                            recordId,
                            formData
                        );
                    },

                onError:
                    (error) => {
                        this.handleFormError(
                            error
                        );
                    }
            }
        );
    }


    // ========================================================================
    // TABLE ACTIONS
    // ========================================================================

    initializeTableActions() {

        bindMedicalRecordActions(

            this.elements.recordsTableBody,

            {
                onView:
                    (recordId) => {
                        return this.handleViewRecord(
                            recordId
                        );
                    },

                onEdit:
                    (recordId) => {
                        return this.handleEditRecord(
                            recordId
                        );
                    },

                onDelete:
                    (recordId) => {
                        return this.handleDeleteRecord(
                            recordId
                        );
                    }
            }
        );
    }


    // ========================================================================
    // LOAD PATIENTS + DOCTORS
    // ========================================================================

    async loadReferenceData() {

        if (
            this.state.isLoadingReferenceData
        ) {
            return;
        }


        this.state.isLoadingReferenceData = true;


        try {

            const [
                patientsResponse,
                doctorsResponse
            ] = await Promise.all(
                [
                    getPatients(),
                    getDoctors()
                ]
            );


            this.state.patients =
                this.extractCollection(
                    patientsResponse,
                    "patients"
                );


            this.state.doctors =
                this.extractCollection(
                    doctorsResponse,
                    "doctors"
                );


            // ----------------------------------------------------------------
            // Filter dropdowns
            // ----------------------------------------------------------------

            populatePatientSelect(
                this.elements.patientFilter,
                this.state.patients,
                {
                    includeAll: true
                }
            );


            populateDoctorSelect(
                this.elements.doctorFilter,
                this.state.doctors,
                {
                    includeAll: true
                }
            );


            // ----------------------------------------------------------------
            // Form dropdowns
            // ----------------------------------------------------------------

            populatePatientSelect(
                this.elements.formPatient,
                this.state.patients,
                {
                    placeholder:
                        "Select patient"
                }
            );


            populateDoctorSelect(
                this.elements.formDoctor,
                this.state.doctors,
                {
                    placeholder:
                        "Select doctor"
                }
            );


            console.info(
                `[MediCore] Loaded ${this.state.patients.length} patients and ${this.state.doctors.length} doctors.`
            );

        } catch (error) {

            console.error(
                "[MediCore] Failed to load patients/doctors:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to load patients or doctors."
                ),
                "danger"
            );


            // Do not crash the entire page because a reference
            // dropdown failed. The record list can still load.
        } finally {

            this.state.isLoadingReferenceData = false;
        }
    }


    // ========================================================================
    // LOAD MEDICAL RECORDS
    // ========================================================================

    async loadMedicalRecords() {

        if (
            this.state.isLoadingRecords
        ) {
            return;
        }


        this.state.isLoadingRecords = true;


        renderMedicalRecordsLoading(
            this.elements.recordsTableBody
        );


        try {

            const response =
                await getMedicalRecords(
                    this.buildFilters()
                );


            this.state.records =
                this.extractCollection(
                    response,
                    "records"
                );


            renderMedicalRecords(
                this.state.records,
                this.elements.recordsTableBody
            );


            this.updateRecordsCount();


            console.info(
                `[MediCore] Loaded ${this.state.records.length} medical records.`
            );


        } catch (error) {

            console.error(
                "[MediCore] Failed to load medical records:",
                error
            );


            this.state.records = [];


            renderMedicalRecordsError(
                this.elements.recordsTableBody,
                this.getErrorMessage(
                    error,
                    "Unable to load medical records."
                )
            );


            this.updateRecordsCount();


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to load medical records."
                ),
                "danger"
            );


        } finally {

            this.state.isLoadingRecords = false;
        }
    }


    // ========================================================================
    // FILTER OBJECT
    // ========================================================================

    buildFilters() {

        const filters = {};


        if (
            this.state.filters.search
        ) {
            filters.search =
                this.state.filters.search;
        }


        if (
            this.state.filters.patient
        ) {
            filters.patient =
                this.state.filters.patient;
        }


        if (
            this.state.filters.doctor
        ) {
            filters.doctor =
                this.state.filters.doctor;
        }


        if (
            this.state.filters.date
        ) {
            filters.date =
                this.state.filters.date;
        }


        return filters;
    }


    // ========================================================================
    // CLEAR FILTERS
    // ========================================================================

    clearFilters() {

        this.state.filters = {
            search: "",
            patient: "",
            doctor: "",
            date: ""
        };


        this.elements.searchInput.value = "";

        this.elements.patientFilter.value = "";

        this.elements.doctorFilter.value = "";

        this.elements.dateFilter.value = "";


        this.loadMedicalRecords();
    }


    // ========================================================================
    // SEARCH DEBOUNCE
    // ========================================================================

    debounceSearch() {

        clearTimeout(
            this.state.searchTimer
        );


        this.state.searchTimer =
            setTimeout(
                () => {
                    this.loadMedicalRecords();
                },
                350
            );
    }


    // ========================================================================
    // ADD BUTTON
    // ========================================================================

    handleCreateButton() {

        this.state.editingRecordId = null;

        openCreateMedicalRecord();
    }


    // ========================================================================
    // CREATE
    // ========================================================================

    async handleCreateRecord(
        formData
    ) {

        try {

            await createMedicalRecord(
                formData
            );


            this.hideFormModal();


            this.showToast(
                "Medical record created successfully.",
                "success"
            );


            await this.loadMedicalRecords();


        } catch (error) {

            console.error(
                "[MediCore] Create medical record error:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to create medical record."
                ),
                "danger"
            );


            throw error;
        }
    }


    // ========================================================================
    // VIEW
    // ========================================================================

    async handleViewRecord(
        recordId
    ) {

        if (!recordId) {
            return;
        }


        try {

            this.showViewLoading();


            const response =
                await getMedicalRecord(
                    recordId
                );


            const record =
                this.extractSingleRecord(
                    response
                );


            if (!record) {

                throw new Error(
                    "Medical record was not found."
                );
            }


            renderMedicalRecordDetails(
                record,
                this.elements.viewContainer
            );


            this.showViewModal();


        } catch (error) {

            console.error(
                "[MediCore] View medical record error:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to load medical record."
                ),
                "danger"
            );
        }
    }


    // ========================================================================
    // EDIT
    // ========================================================================

    async handleEditRecord(
        recordId
    ) {

        if (!recordId) {
            return;
        }


        try {

            const response =
                await getMedicalRecord(
                    recordId
                );


            const record =
                this.extractSingleRecord(
                    response
                );


            if (!record) {

                throw new Error(
                    "Medical record was not found."
                );
            }


            this.state.editingRecordId =
                recordId;


            openEditMedicalRecord(
                record
            );


        } catch (error) {

            console.error(
                "[MediCore] Edit medical record error:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to load medical record."
                ),
                "danger"
            );
        }
    }


    // ========================================================================
    // UPDATE
    // ========================================================================

    async handleUpdateRecord(
        recordId,
        formData
    ) {

        if (!recordId) {

            throw new Error(
                "Medical record ID is required."
            );
        }


        try {

            await updateMedicalRecord(
                recordId,
                formData
            );


            this.state.editingRecordId =
                null;


            this.hideFormModal();


            this.showToast(
                "Medical record updated successfully.",
                "success"
            );


            await this.loadMedicalRecords();


        } catch (error) {

            console.error(
                "[MediCore] Update medical record error:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to update medical record."
                ),
                "danger"
            );


            throw error;
        }
    }


    // ========================================================================
    // DELETE
    // ========================================================================

    async handleDeleteRecord(
        recordId
    ) {

        if (!recordId) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this medical record? This action cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteMedicalRecord(
                recordId
            );


            this.showToast(
                "Medical record deleted successfully.",
                "success"
            );


            await this.loadMedicalRecords();


        } catch (error) {

            console.error(
                "[MediCore] Delete medical record error:",
                error
            );


            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to delete medical record."
                ),
                "danger"
            );
        }
    }


    // ========================================================================
    // FORM ERROR
    // ========================================================================

    handleFormError(
        error
    ) {

        console.error(
            "[MediCore] Medical record form error:",
            error
        );


        this.showToast(
            this.getErrorMessage(
                error,
                "Unable to save medical record."
            ),
            "danger"
        );
    }


    // ========================================================================
    // MODAL — HIDE FORM
    // ========================================================================

    hideFormModal() {

        if (
            !this.elements.formModal ||
            !window.bootstrap
        ) {
            return;
        }


        const modal =
            bootstrap.Modal.getInstance(
                this.elements.formModal
            );


        if (modal) {
            modal.hide();
        }
    }


    // ========================================================================
    // MODAL — VIEW LOADING
    // ========================================================================

    showViewLoading() {

        if (
            !this.elements.viewContainer
        ) {
            return;
        }


        this.elements.viewContainer.innerHTML = `
            <div
                class="d-flex align-items-center justify-content-center gap-2 py-5"
            >
                <div
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                ></div>

                <span>
                    Loading medical record...
                </span>
            </div>
        `;
    }


    // ========================================================================
    // MODAL — SHOW VIEW
    // ========================================================================

    showViewModal() {

        if (
            !this.elements.viewModal ||
            !window.bootstrap
        ) {
            return;
        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                this.elements.viewModal
            );


        modal.show();
    }


    // ========================================================================
    // RECORD COUNT
    // ========================================================================

    updateRecordsCount() {

        if (
            !this.elements.recordsCount
        ) {
            return;
        }


        const count =
            this.state.records.length;


        this.elements.recordsCount.textContent =
            `${count} ${
                count === 1
                    ? "record"
                    : "records"
            }`;
    }


    // ========================================================================
    // RESPONSE — COLLECTION
    // ========================================================================

    extractCollection(
        response,
        preferredKey = "records"
    ) {

        if (!response) {
            return [];
        }


        // ---------------------------------------------------------------
        // Direct array
        // ---------------------------------------------------------------

        if (
            Array.isArray(response)
        ) {
            return response;
        }


        // ---------------------------------------------------------------
        // Axios response:
        // { data: ... }
        // ---------------------------------------------------------------

        const payload =
            response.data;


        if (
            Array.isArray(payload)
        ) {
            return payload;
        }


        if (
            payload &&
            typeof payload === "object"
        ) {

            if (
                Array.isArray(
                    payload[preferredKey]
                )
            ) {
                return payload[preferredKey];
            }


            if (
                Array.isArray(
                    payload.data
                )
            ) {
                return payload.data;
            }


            if (
                Array.isArray(
                    payload.records
                )
            ) {
                return payload.records;
            }


            if (
                Array.isArray(
                    payload.patients
                )
            ) {
                return payload.patients;
            }


            if (
                Array.isArray(
                    payload.doctors
                )
            ) {
                return payload.doctors;
            }
        }


        // ---------------------------------------------------------------
        // Non-Axios object
        // ---------------------------------------------------------------

        if (
            Array.isArray(
                response[preferredKey]
            )
        ) {
            return response[preferredKey];
        }


        if (
            Array.isArray(
                response.records
            )
        ) {
            return response.records;
        }


        if (
            Array.isArray(
                response.patients
            )
        ) {
            return response.patients;
        }


        if (
            Array.isArray(
                response.doctors
            )
        ) {
            return response.doctors;
        }


        return [];
    }


    // ========================================================================
    // RESPONSE — SINGLE RECORD
    // ========================================================================

    extractSingleRecord(
        response
    ) {

        if (!response) {
            return null;
        }


        if (
            response.data &&
            typeof response.data === "object"
        ) {

            const payload =
                response.data;


            if (
                payload.record &&
                typeof payload.record === "object"
            ) {
                return payload.record;
            }


            if (
                payload.medicalRecord &&
                typeof payload.medicalRecord === "object"
            ) {
                return payload.medicalRecord;
            }


            if (
                payload.data &&
                typeof payload.data === "object" &&
                !Array.isArray(payload.data)
            ) {
                return payload.data;
            }


            if (
                payload._id ||
                payload.id
            ) {
                return payload;
            }
        }


        if (
            response.record &&
            typeof response.record === "object"
        ) {
            return response.record;
        }


        if (
            response.medicalRecord &&
            typeof response.medicalRecord === "object"
        ) {
            return response.medicalRecord;
        }


        if (
            response._id ||
            response.id
        ) {
            return response;
        }


        return null;
    }


    // ========================================================================
    // ERROR MESSAGE
    // ========================================================================

    getErrorMessage(
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


    // ========================================================================
    // INITIALIZATION ERROR
    // ========================================================================

    handleInitializationError(
        error
    ) {

        if (
            this.elements.recordsTableBody
        ) {

            renderMedicalRecordsError(
                this.elements.recordsTableBody,
                "Unable to initialize Medical Records."
            );
        }


        if (
            this.elements.toastContainer
        ) {

            this.showToast(
                this.getErrorMessage(
                    error,
                    "Unable to initialize Medical Records."
                ),
                "danger"
            );
        }
    }


    // ========================================================================
    // TOAST
    // ========================================================================

    showToast(
        message,
        type = "success"
    ) {

        if (
            !this.elements.toastContainer
        ) {

            console[
                type === "danger"
                    ? "error"
                    : "log"
            ](
                `[MediCore] ${message}`
            );

            return;
        }


        const iconMap = {

            success:
                "bi-check-circle-fill",

            danger:
                "bi-exclamation-circle-fill",

            warning:
                "bi-exclamation-triangle-fill",

            info:
                "bi-info-circle-fill"
        };


        const icon =
            iconMap[type] ||
            iconMap.info;


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `toast align-items-center text-bg-${type} border-0`;


        toast.setAttribute(
            "role",
            "alert"
        );


        toast.setAttribute(
            "aria-live",
            "assertive"
        );


        toast.setAttribute(
            "aria-atomic",
            "true"
        );


        toast.innerHTML = `
            <div class="d-flex">

                <div class="toast-body">

                    <i
                        class="bi ${icon} me-2"
                        aria-hidden="true"
                    ></i>

                    ${this.escapeHtml(message)}

                </div>

                <button
                    type="button"
                    class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>

            </div>
        `;


        this.elements.toastContainer.appendChild(
            toast
        );


        if (
            window.bootstrap &&
            bootstrap.Toast
        ) {

            const bootstrapToast =
                new bootstrap.Toast(
                    toast,
                    {
                        delay: 3500
                    }
                );


            toast.addEventListener(
                "hidden.bs.toast",
                () => {
                    toast.remove();
                },
                {
                    once: true
                }
            );


            bootstrapToast.show();

        } else {

            setTimeout(
                () => {
                    toast.remove();
                },
                3500
            );
        }
    }


    // ========================================================================
    // HTML ESCAPING
    // ========================================================================

    escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    // ========================================================================
    // PUBLIC DEBUG API
    // ========================================================================
    //
    // Chrome DevTools:
    //
    //     window.mediCoreMedicalRecords
    //
    // Examples:
    //
    //     window.mediCoreMedicalRecords.reload()
    //     window.mediCoreMedicalRecords.clearFilters()
    //     window.mediCoreMedicalRecords.getState()
    //
    // ========================================================================

    getDebugApi() {

        return {

            reload:
                () => this.loadMedicalRecords(),

            reloadReferenceData:
                () => this.loadReferenceData(),

            clearFilters:
                () => this.clearFilters(),

            getState:
                () => ({
                    records:
                        this.state.records,

                    patients:
                        this.state.patients,

                    doctors:
                        this.state.doctors,

                    filters:
                        {
                            ...this.state.filters
                        },

                    isLoadingRecords:
                        this.state.isLoadingRecords,

                    isLoadingReferenceData:
                        this.state.isLoadingReferenceData,

                    editingRecordId:
                        this.state.editingRecordId
                })
        };
    }
}


// ============================================================================
// PAGE BOOT
// ============================================================================

const medicalRecordsController =
    new MedicalRecordsController();


function bootMedicalRecordsPage() {

    medicalRecordsController
        .init()
        .catch(
            (error) => {

                console.error(
                    "[MediCore] Fatal Medical Records boot error:",
                    error
                );
            }
        );
}


// ============================================================================
// DOM READY
// ============================================================================
//
// The HTML currently loads this file with:
//
// <script type="module" src="../js/medical-records/medical-records.js"></script>
//
// ES modules are deferred by the browser, but this check also makes the
// controller safe if it is loaded after DOMContentLoaded.
// ============================================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        bootMedicalRecordsPage,
        {
            once: true
        }
    );

} else {

    bootMedicalRecordsPage();
}


// ============================================================================
// DEVELOPMENT ACCESS
// ============================================================================

window.mediCoreMedicalRecords =
    medicalRecordsController.getDebugApi();


// ============================================================================
// END OF FILE
// ============================================================================