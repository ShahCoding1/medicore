document.addEventListener(
    "DOMContentLoaded",
    initializeBedsPage
);


async function initializeBedsPage() {
    setupBedEvents();

    setBedsLoading(true);

    try {
        await loadBedResources();

        renderAllBedOptions();

        await refreshBeds();

    } catch (error) {
        console.error(
            "Beds initialization error:",
            error
        );

        showBedToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to load bed management data.",
            "danger"
        );

    } finally {
        setBedsLoading(false);
    }
}


async function refreshBeds() {
    setBedsLoading(true);

    try {
        await Promise.all([
            loadBeds(),
            loadBedSummary()
        ]);

        renderBedSummary();
        renderBedTable();

    } catch (error) {
        console.error(
            "Refresh beds error:",
            error
        );

        showBedToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to refresh beds.",
            "danger"
        );

    } finally {
        setBedsLoading(false);
    }
}


function setupBedEvents() {

    const addButton =
        document.getElementById(
            "addBedBtn"
        );

    if (addButton) {
        addButton.addEventListener(
            "click",
            openCreateBedModal
        );
    }


    const emptyButton =
        document.getElementById(
            "emptyCreateBedBtn"
        );

    if (emptyButton) {
        emptyButton.addEventListener(
            "click",
            openCreateBedModal
        );
    }


    const refreshButton =
        document.getElementById(
            "refreshBedsBtn"
        );

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            refreshBeds
        );
    }


    const form =
        document.getElementById(
            "bedForm"
        );

    if (form) {
        form.addEventListener(
            "submit",
            handleBedFormSubmit
        );
    }


    const assignForm =
        document.getElementById(
            "assignBedForm"
        );

    if (assignForm) {
        assignForm.addEventListener(
            "submit",
            handleAssignBedSubmit
        );
    }


    const table =
        document.getElementById(
            "bedsTableBody"
        );

    if (table) {
        table.addEventListener(
            "click",
            handleBedTableAction
        );
    }


    const applyButton =
        document.getElementById(
            "applyBedFilters"
        );

    if (applyButton) {
        applyButton.addEventListener(
            "click",
            applyBedFilters
        );
    }


    const clearButton =
        document.getElementById(
            "clearBedFilters"
        );

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearBedFilters
        );
    }


    const searchInput =
        document.getElementById(
            "bedSearch"
        );

    if (searchInput) {
        searchInput.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    applyBedFilters();
                }
            }
        );
    }

}


async function handleBedTableAction(event) {
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

    if (!id) {
        return;
    }

    switch (action) {

        case "assign":
            openAssignBedModal(id);
            break;

        case "release":
            await handleReleaseBed(id);
            break;

        case "edit":
            await openEditBedModal(id);
            break;

        case "delete":
            await handleDeleteBed(id);
            break;

        case "view":
            await viewBedDetails(id);
            break;

        default:
            break;
    }
}


function applyBedFilters() {
    bedsData.filters.search =
        document.getElementById(
            "bedSearch"
        ).value.trim();

    bedsData.filters.status =
        document.getElementById(
            "bedStatusFilter"
        ).value;

    bedsData.filters.bedType =
        document.getElementById(
            "bedTypeFilter"
        ).value;

    bedsData.filters.ward =
        document.getElementById(
            "bedWardFilter"
        ).value.trim();

    bedsData.filters.floor =
        document.getElementById(
            "bedFloorFilter"
        ).value.trim();

    refreshBeds();
}


function clearBedFilters() {

    document.getElementById(
        "bedSearch"
    ).value = "";

    document.getElementById(
        "bedStatusFilter"
    ).value = "";

    document.getElementById(
        "bedTypeFilter"
    ).value = "";

    document.getElementById(
        "bedWardFilter"
    ).value = "";

    document.getElementById(
        "bedFloorFilter"
    ).value = "";

    bedsData.filters = {
        search: "",
        status: "",
        bedType: "",
        ward: "",
        floor: ""
    };

    refreshBeds();
}


async function viewBedDetails(id) {
    try {
        const bed =
            getBedById(id) ||
            await getBed(id);

        const patientName =
            getPatientName(
                bed.patient
            );

        const admissionNumber =
            typeof bed.admission === "object"
                ? bed.admission?.admissionNumber
                : "";

        const message = [
            `Bed: ${bed.bedNumber || "—"}`,
            `Ward: ${bed.ward || "—"}`,
            `Room: ${bed.roomNumber || "—"}`,
            `Floor: ${bed.floor || "—"}`,
            `Type: ${formatBedType(
                bed.bedType
            )}`,
            `Status: ${formatBedStatus(
                bed.status
            )}`,
            `Patient: ${patientName}`,
            `Admission: ${
                admissionNumber || "None"
            }`,
            `Notes: ${bed.notes || "None"}`
        ].join("\n");

        window.alert(message);

    } catch (error) {
        console.error(
            "View bed error:",
            error
        );

        showBedToast(
            error.message ||
                "Unable to load bed details.",
            "danger"
        );
    }
}