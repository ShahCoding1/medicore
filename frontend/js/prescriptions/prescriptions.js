/* =========================================================
   MEDICORE — PRESCRIPTIONS CONTROLLER
   Phase 11
   Page initialization, loading, filters, CRUD actions.
   ========================================================= */

(function () {
    "use strict";

    const data = window.mediCorePrescriptionData;
    const ui = window.mediCorePrescriptionUI;
    const form = window.mediCorePrescriptionForm;

    if (!data || !ui || !form) {
        console.error(
            "MediCore Prescription modules are not available."
        );
        return;
    }

    const state = {
        prescriptions: [],
        filteredPrescriptions: [],
        patients: [],
        doctors: [],
        loading: false
    };

    const elements = {
        search: document.getElementById(
            "prescriptionSearch"
        ),

        patientFilter: document.getElementById(
            "prescriptionPatientFilter"
        ),

        doctorFilter: document.getElementById(
            "prescriptionDoctorFilter"
        ),

        dateFilter: document.getElementById(
            "prescriptionDateFilter"
        ),

        clearFilters: document.getElementById(
            "clearPrescriptionFilters"
        ),

        refresh: document.getElementById(
            "refreshPrescriptionsBtn"
        ),

        add: document.getElementById(
            "addPrescriptionBtn"
        ),

        emptyAdd: document.getElementById(
            "emptyAddPrescriptionBtn"
        ),

        tableBody: document.getElementById(
            "prescriptionsTableBody"
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

    function getName(value) {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        if (value.name) {
            return value.name;
        }

        return [
            value.firstName,
            value.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .trim();
    }

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

    function normalizePrescription(
        prescription
    ) {
        return ui.normalizePrescription(
            prescription
        );
    }

    function getPatientName(
        prescription
    ) {
        return ui.getPatientName(
            prescription
        );
    }

    function getDoctorName(
        prescription
    ) {
        return ui.getDoctorName(
            prescription
        );
    }

    function getDate(
        prescription
    ) {
        return ui.getPrescriptionDate(
            prescription
        );
    }

    function normalizeDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value).slice(0, 10);
        }

        return date
            .toISOString()
            .slice(0, 10);
    }

    /* =====================================================
       DROPDOWN FILTERS
       ===================================================== */

    async function loadFilterData() {
        try {
            const [
                patientResponse,
                doctorResponse
            ] = await Promise.all([
                data.getPatients({
                    limit: 1000
                }),

                data.getDoctors({
                    limit: 1000
                })
            ]);

            state.patients =
                getArrayFromResponse(
                    patientResponse
                );

            state.doctors =
                getArrayFromResponse(
                    doctorResponse
                );

            populatePatientFilter();
            populateDoctorFilter();

        } catch (error) {
            console.error(
                "Failed to load prescription filter data:",
                error
            );

            /*
             * Do not block prescription loading if dropdown
             * data cannot be loaded.
             */
        }
    }

    function populatePatientFilter() {
        if (!elements.patientFilter) {
            return;
        }

        const currentValue =
            elements.patientFilter.value;

        const options =
            state.patients
                .map((patient) => {
                    const id =
                        getId(patient);

                    const name =
                        getName(patient) ||
                        "Unnamed patient";

                    return `
                        <option value="${ui.escapeHTML(id)}">
                            ${ui.escapeHTML(name)}
                        </option>
                    `;
                })
                .join("");

        elements.patientFilter.innerHTML = `
            <option value="">
                All Patients
            </option>
            ${options}
        `;

        if (
            currentValue &&
            state.patients.some(
                (patient) =>
                    String(
                        getId(patient)
                    ) === String(currentValue)
            )
        ) {
            elements.patientFilter.value =
                currentValue;
        }
    }

    function populateDoctorFilter() {
        if (!elements.doctorFilter) {
            return;
        }

        const currentValue =
            elements.doctorFilter.value;

        const options =
            state.doctors
                .map((doctor) => {
                    const id =
                        getId(doctor);

                    const name =
                        getName(doctor) ||
                        "Unnamed doctor";

                    return `
                        <option value="${ui.escapeHTML(id)}">
                            ${ui.escapeHTML(name)}
                        </option>
                    `;
                })
                .join("");

        elements.doctorFilter.innerHTML = `
            <option value="">
                All Doctors
            </option>
            ${options}
        `;

        if (
            currentValue &&
            state.doctors.some(
                (doctor) =>
                    String(
                        getId(doctor)
                    ) === String(currentValue)
            )
        ) {
            elements.doctorFilter.value =
                currentValue;
        }
    }

    /* =====================================================
       LOAD PRESCRIPTIONS
       ===================================================== */

    async function loadPrescriptions() {
        if (state.loading) {
            return;
        }

        state.loading = true;

        ui.showLoading();

        try {
            const response =
                await data.getPrescriptions();

            state.prescriptions =
                getArrayFromResponse(
                    response
                ).map(
                    normalizePrescription
                );

            applyFilters();

        } catch (error) {
            console.error(
                "Failed to load prescriptions:",
                error
            );

            state.prescriptions = [];
            state.filteredPrescriptions = [];

            ui.updateSummary([]);

            if (elements.tableBody) {
                elements.tableBody.innerHTML = "";
            }

            ui.showEmpty();

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to load prescriptions."
                ),
                "error"
            );

        } finally {
            state.loading = false;
        }
    }

    /* =====================================================
       FILTERING
       ===================================================== */

    function applyFilters() {
        const searchTerm =
            elements.search?.value
                ?.trim()
                .toLowerCase() || "";

        const patientId =
            elements.patientFilter
                ?.value || "";

        const doctorId =
            elements.doctorFilter
                ?.value || "";

        const selectedDate =
            elements.dateFilter
                ?.value || "";

        state.filteredPrescriptions =
            state.prescriptions.filter(
                (prescription) => {
                    const patient =
                        prescription.patient;

                    const doctor =
                        prescription.doctor;

                    const patientObjectId =
                        getId(patient) ||
                        prescription.patientId ||
                        "";

                    const doctorObjectId =
                        getId(doctor) ||
                        prescription.doctorId ||
                        "";

                    const patientName =
                        getPatientName(
                            prescription
                        ).toLowerCase();

                    const doctorName =
                        getDoctorName(
                            prescription
                        ).toLowerCase();

                    const diagnosis =
                        String(
                            prescription.diagnosis ||
                            ""
                        ).toLowerCase();

                    const medicines =
                        Array.isArray(
                            prescription.medicines
                        )
                            ? prescription.medicines
                            : [];

                    const medicineText =
                        medicines
                            .map(
                                (medicine) =>
                                    [
                                        medicine.name,
                                        medicine.medicine,
                                        medicine.medicineName,
                                        medicine.dosage,
                                        medicine.frequency
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                            )
                            .join(" ")
                            .toLowerCase();

                    const searchMatches =
                        !searchTerm ||
                        patientName.includes(
                            searchTerm
                        ) ||
                        doctorName.includes(
                            searchTerm
                        ) ||
                        diagnosis.includes(
                            searchTerm
                        ) ||
                        medicineText.includes(
                            searchTerm
                        );

                    const patientMatches =
                        !patientId ||
                        String(
                            patientObjectId
                        ) === String(
                            patientId
                        );

                    const doctorMatches =
                        !doctorId ||
                        String(
                            doctorObjectId
                        ) === String(
                            doctorId
                        );

                    const dateMatches =
                        !selectedDate ||
                        normalizeDate(
                            getDate(
                                prescription
                            )
                        ) === selectedDate;

                    return (
                        searchMatches &&
                        patientMatches &&
                        doctorMatches &&
                        dateMatches
                    );
                }
            );

        ui.renderTable(
            state.filteredPrescriptions
        );
    }

    function clearFilters() {
        if (elements.search) {
            elements.search.value = "";
        }

        if (elements.patientFilter) {
            elements.patientFilter.value = "";
        }

        if (elements.doctorFilter) {
            elements.doctorFilter.value = "";
        }

        if (elements.dateFilter) {
            elements.dateFilter.value = "";
        }

        applyFilters();
    }

    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    function findPrescription(id) {
        return state.prescriptions.find(
            (prescription) =>
                String(
                    getId(prescription)
                ) === String(id)
        );
    }

    async function handleView(id) {
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

            ui.openViewModal(
                normalizePrescription(
                    prescription
                )
            );

        } catch (error) {
            console.error(
                "Failed to load prescription details:",
                error
            );

            /*
             * If the detail request fails, use the
             * already-loaded table record as fallback.
             */
            const fallback =
                findPrescription(id);

            if (fallback) {
                ui.openViewModal(
                    fallback
                );

                return;
            }

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to open prescription."
                ),
                "error"
            );
        }
    }

    function handleEdit(id) {
        if (!id) {
            return;
        }

        form.openEdit(id);
    }

    async function handleDelete(id) {
        if (!id) {
            return;
        }

        const prescription =
            findPrescription(id);

        const patientName =
            prescription
                ? getPatientName(
                    prescription
                )
                : "this prescription";

        const confirmed =
            window.confirm(
                `Delete the prescription for ${patientName}?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            await data.deletePrescription(
                id
            );

            ui.showToast(
                "Prescription deleted successfully.",
                "success"
            );

            await loadPrescriptions();

        } catch (error) {
            console.error(
                "Failed to delete prescription:",
                error
            );

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to delete prescription."
                ),
                "error"
            );
        }
    }

    function handleTableAction(
        event
    ) {
        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

        if (action === "view") {
            handleView(id);
            return;
        }

        if (action === "edit") {
            handleEdit(id);
            return;
        }

        if (action === "delete") {
            handleDelete(id);
        }
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {
        elements.search?.addEventListener(
            "input",
            applyFilters
        );

        elements.patientFilter?.addEventListener(
            "change",
            applyFilters
        );

        elements.doctorFilter?.addEventListener(
            "change",
            applyFilters
        );

        elements.dateFilter?.addEventListener(
            "change",
            applyFilters
        );

        elements.clearFilters?.addEventListener(
            "click",
            clearFilters
        );

        elements.refresh?.addEventListener(
            "click",
            async () => {
                await loadFilterData();
                await loadPrescriptions();

                ui.showToast(
                    "Prescription records refreshed.",
                    "success"
                );
            }
        );

        elements.add?.addEventListener(
            "click",
            () => {
                form.openCreate();
            }
        );

        elements.emptyAdd?.addEventListener(
            "click",
            () => {
                form.openCreate();
            }
        );

        elements.tableBody?.addEventListener(
            "click",
            handleTableAction
        );

        window.addEventListener(
            "medicore:prescription:saved",
            async () => {
                await loadPrescriptions();
            }
        );
    }

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function init() {
        bindEvents();

        /*
         * Form initialization is handled by
         * prescriptions-form.js.
         */
        await loadFilterData();

        await loadPrescriptions();
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.mediCorePrescriptions = {
        state,

        init,
        loadPrescriptions,
        loadFilterData,

        applyFilters,
        clearFilters,

        handleView,
        handleEdit,
        handleDelete
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