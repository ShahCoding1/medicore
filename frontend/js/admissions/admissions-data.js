const admissionsControllerState = {
    admissions: [],
    summary: {}
};

const loadAdmissions = async () => {
    const ui =
        window.mediCoreAdmissionsUI;

    ui.showLoadingState();

    try {
        const data =
            window.mediCoreAdmissionsData;

        const [
            admissions,
            summary
        ] = await Promise.all([
            data.getAdmissions(),
            data.getAdmissionSummary()
        ]);

        admissionsControllerState
            .admissions =
            admissions;

        admissionsControllerState
            .summary =
            summary;

        ui.renderSummary(summary);
        ui.renderAdmissions(admissions);
    } catch (error) {
        console.error(
            "Load admissions error:",
            error
        );

        ui.showToast(
            dataErrorMessage(error),
            "danger"
        );

        ui.renderAdmissions([]);
    } finally {
        ui.hideLoadingState();
    }
};

const dataErrorMessage = (
    error
) => {
    return window
        .mediCoreAdmissionsData
        .getErrorMessage(error);
};

const refreshAdmissions = async () => {
    const button =
        document.getElementById(
            "refreshAdmissionsBtn"
        );

    if (button) {
        button.disabled = true;

        button
            .querySelector("i")
            ?.classList.add(
                "fa-spin"
            );
    }

    try {
        await loadAdmissions();
    } finally {
        if (button) {
            button.disabled = false;

            button
                .querySelector("i")
                ?.classList.remove(
                    "fa-spin"
                );
        }
    }
};

const applyAdmissionFilters = () => {
    const getValue = (id) =>
        document.getElementById(id)
            ?.value
            ?.trim() || "";

    window.mediCoreAdmissionsUI
        .filterAdmissions({
            search:
                getValue(
                    "admissionSearch"
                ),

            status:
                getValue(
                    "admissionStatusFilter"
                ),

            type:
                getValue(
                    "admissionTypeFilter"
                ),

            priority:
                getValue(
                    "admissionPriorityFilter"
                ),

            dateFrom:
                getValue(
                    "admissionDateFrom"
                ),

            dateTo:
                getValue(
                    "admissionDateTo"
                )
        });
};

const clearAdmissionFilters = () => {
    [
        "admissionSearch",
        "admissionStatusFilter",
        "admissionTypeFilter",
        "admissionPriorityFilter",
        "admissionDateFrom",
        "admissionDateTo"
    ].forEach((id) => {
        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });

    applyAdmissionFilters();
};

const handleAdmissionAction = async (
    event
) => {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) return;

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;

    if (!id) return;

    const ui =
        window.mediCoreAdmissionsUI;

    const admission =
        ui.findAdmission(id);

    if (!admission) {
        ui.showToast(
            "Admission record not found.",
            "danger"
        );

        return;
    }

    if (action === "view") {
        ui.openViewModal(
            admission
        );

        return;
    }

    if (action === "edit") {
        await window
            .mediCoreAdmissionsForm
            .openEdit(admission);

        return;
    }

    if (action === "delete") {
        await deleteAdmissionRecord(
            admission
        );
    }
};

const deleteAdmissionRecord = async (
    admission
) => {
    const data =
        window.mediCoreAdmissionsData;

    const ui =
        window.mediCoreAdmissionsUI;

    const admissionNumber =
        admission.admissionNumber ||
        "this admission";

    const confirmed =
        window.confirm(
            `Delete ${admissionNumber}? This action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    try {
        await data.deleteAdmission(
            admission._id
        );

        ui.showToast(
            "Admission deleted successfully."
        );

        await loadAdmissions();
    } catch (error) {
        console.error(
            "Delete admission error:",
            error
        );

        ui.showToast(
            data.getErrorMessage(error),
            "danger"
        );
    }
};

const bindAdmissionEvents = () => {
    document
        .getElementById(
            "refreshAdmissionsBtn"
        )
        ?.addEventListener(
            "click",
            refreshAdmissions
        );

    document
        .getElementById(
            "addAdmissionBtn"
        )
        ?.addEventListener(
            "click",
            async () => {
                await window
                    .mediCoreAdmissionsForm
                    .openCreate();
            }
        );

    document
        .getElementById(
            "emptyCreateAdmissionBtn"
        )
        ?.addEventListener(
            "click",
            async () => {
                await window
                    .mediCoreAdmissionsForm
                    .openCreate();
            }
        );

    document
        .getElementById(
            "clearAdmissionFilters"
        )
        ?.addEventListener(
            "click",
            clearAdmissionFilters
        );

    document
        .getElementById(
            "applyAdmissionDateFilter"
        )
        ?.addEventListener(
            "click",
            applyAdmissionFilters
        );

    document
        .getElementById(
            "admissionSearch"
        )
        ?.addEventListener(
            "input",
            applyAdmissionFilters
        );

    document
        .getElementById(
            "admissionStatusFilter"
        )
        ?.addEventListener(
            "change",
            applyAdmissionFilters
        );

    document
        .getElementById(
            "admissionTypeFilter"
        )
        ?.addEventListener(
            "change",
            applyAdmissionFilters
        );

    document
        .getElementById(
            "admissionPriorityFilter"
        )
        ?.addEventListener(
            "change",
            applyAdmissionFilters
        );

    document
        .getElementById(
            "admissionsTableBody"
        )
        ?.addEventListener(
            "click",
            handleAdmissionAction
        );
};

const initAdmissions = async () => {
    window.mediCoreAdmissionsUI
        .cacheElements();

    window.mediCoreAdmissionsForm
        .init();

    bindAdmissionEvents();

    window.mediCoreAdmissionsRefresh =
        refreshAdmissions;

    await loadAdmissions();
};

document.addEventListener(
    "DOMContentLoaded",
    initAdmissions
);

window.mediCoreAdmissions = {
    state:
        admissionsControllerState,

    init:
        initAdmissions,

    load:
        loadAdmissions,

    refresh:
        refreshAdmissions,

    filter:
        applyAdmissionFilters,

    clearFilters:
        clearAdmissionFilters
};