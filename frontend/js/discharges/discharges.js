let dischargesInitialized = false;

async function initializeDischargesPage() {
    if (dischargesInitialized) {
        return;
    }

    dischargesInitialized = true;

    try {
        setDischargesLoading(true);

        bindDischargeFormEvents();
        bindDischargePageEvents();

        await loadDischargeResources();

        populateDischargePatientOptions();
        populateDischargeDoctorOptions();
        populateDischargeAdmissionOptions();

        await refreshDischargeData();

        renderDischargeSummary();
        renderDischargesTable();
    } catch (error) {
        console.error(
            "Failed to initialize Discharges page:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to load discharge records."
            ),
            "danger"
        );
    } finally {
        setDischargesLoading(false);
    }
}

function bindDischargePageEvents() {
    const refreshButton = document.getElementById(
        "refreshDischargesBtn"
    );

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            refreshDischargesPage
        );
    }

    const searchInput = document.getElementById(
        "dischargeSearch"
    );

    if (searchInput) {
        searchInput.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    applyDischargeFilters();
                }
            }
        );
    }

    const applyButton = document.getElementById(
        "applyDischargeFilters"
    );

    if (applyButton) {
        applyButton.addEventListener(
            "click",
            applyDischargeFilters
        );
    }

    const clearButton = document.getElementById(
        "clearDischargeFilters"
    );

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearDischargeFilters
        );
    }

    const tableBody = document.getElementById(
        "dischargesTableBody"
    );

    if (tableBody) {
        tableBody.addEventListener(
            "click",
            handleDischargeTableAction
        );
    }

    const patientFilter = document.getElementById(
        "dischargePatientFilter"
    );

    const doctorFilter = document.getElementById(
        "dischargeDoctorFilter"
    );

    const dateFrom = document.getElementById(
        "dischargeDateFrom"
    );

    const dateTo = document.getElementById(
        "dischargeDateTo"
    );

    [
        patientFilter,
        doctorFilter,
        dateFrom,
        dateTo
    ].forEach((element) => {
        if (element) {
            element.addEventListener(
                "change",
                () => {
                    applyDischargeFilters();
                }
            );
        }
    });
}

async function refreshDischargesPage() {
    try {
        setDischargesLoading(true);

        await refreshDischargeData();

        renderDischargeSummary();
        renderDischargesTable();

        showDischargeToast(
            "Discharge records refreshed.",
            "success"
        );
    } catch (error) {
        console.error(
            "Failed to refresh discharges:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to refresh discharge records."
            ),
            "danger"
        );
    } finally {
        setDischargesLoading(false);
    }
}

async function applyDischargeFilters() {
    const searchInput = document.getElementById(
        "dischargeSearch"
    );

    const patientFilter = document.getElementById(
        "dischargePatientFilter"
    );

    const doctorFilter = document.getElementById(
        "dischargeDoctorFilter"
    );

    const dateFrom = document.getElementById(
        "dischargeDateFrom"
    );

    const dateTo = document.getElementById(
        "dischargeDateTo"
    );

    setDischargeFilters({
        search: searchInput?.value.trim() || "",
        patient: patientFilter?.value || "",
        doctor: doctorFilter?.value || "",
        dateFrom: dateFrom?.value || "",
        dateTo: dateTo?.value || ""
    });

    try {
        setDischargesLoading(true);

        await loadDischarges();

        renderDischargesTable();
    } catch (error) {
        console.error(
            "Failed to apply discharge filters:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to filter discharge records."
            ),
            "danger"
        );
    } finally {
        setDischargesLoading(false);
    }
}

async function clearDischargeFilters() {
    clearDischargeFiltersState();

    const fields = [
        "dischargeSearch",
        "dischargePatientFilter",
        "dischargeDoctorFilter",
        "dischargeDateFrom",
        "dischargeDateTo"
    ];

    fields.forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });

    try {
        setDischargesLoading(true);

        await loadDischarges();

        renderDischargesTable();
    } catch (error) {
        console.error(
            "Failed to clear discharge filters:",
            error
        );

        showDischargeToast(
            getDischargeErrorMessage(
                error,
                "Unable to reload discharge records."
            ),
            "danger"
        );
    } finally {
        setDischargesLoading(false);
    }
}

async function handleDischargeTableAction(event) {
    const button = event.target.closest(
        "[data-action]"
    );

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (!id) {
        return;
    }

    if (action === "view") {
        await handleViewDischarge(id);
        return;
    }

    if (action === "edit") {
        await prepareEditDischarge(id);
        return;
    }

    if (action === "delete") {
        await handleDeleteDischarge(id);
    }
}

function handleDischargeModalFormReset() {
    if (!dischargesData.editingId) {
        resetDischargeForm();
    }
}

function exposeDischargePageFunctions() {
    window.initializeDischargesPage =
        initializeDischargesPage;

    window.refreshDischargesPage =
        refreshDischargesPage;

    window.applyDischargeFilters =
        applyDischargeFilters;

    window.clearDischargeFilters =
        clearDischargeFilters;

    window.handleDischargeTableAction =
        handleDischargeTableAction;
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        exposeDischargePageFunctions();

        await initializeDischargesPage();
    }
);