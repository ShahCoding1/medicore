document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const modalElement =
            document.getElementById(
                "reportBuilderModal"
            );

        const modal =
            new bootstrap.Modal(
                modalElement
            );

        const openButton =
            document.getElementById(
                "openReportBuilder"
            );

        const refreshButton =
            document.getElementById(
                "refreshReports"
            );

        const searchInput =
            document.getElementById(
                "reportSearch"
            );

        const statusFilter =
            document.getElementById(
                "reportStatus"
            );

        const builderForm =
            document.getElementById(
                "reportBuilderForm"
            );

        const alertBox =
            document.getElementById(
                "reportFormAlert"
            );

        const categoryButtons =
            document.querySelectorAll(
                ".category-card"
            );

        reportsForm.init();

        async function refresh() {
            reportsUI.showLoading();

            try {
                await reportsAPI.loadReports();

                reportsUI.render(
                    reportsData.reports
                );
            } catch (error) {
                console.error(
                    "Reports loading failed:",
                    error
                );

                reportsUI.showError(
                    error.response?.data?.message ||
                    "Unable to load reports."
                );
            }
        }

        openButton.addEventListener(
            "click",
            () => {
                builderForm.reset();

                alertBox.className =
                    "alert d-none";

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                document.getElementById(
                    "reportTo"
                ).value = today;

                document.getElementById(
                    "reportFrom"
                ).value = today;

                document.getElementById(
                    "reportSortField"
                ).value = "createdAt";

                modal.show();
            }
        );

        refreshButton.addEventListener(
            "click",
            refresh
        );

        searchInput.addEventListener(
            "input",
            async () => {
                reportsData.filters.search =
                    searchInput.value.trim();

                reportsData.pagination.page = 1;

                await refresh();
            }
        );

        statusFilter.addEventListener(
            "change",
            async () => {
                reportsData.filters.status =
                    statusFilter.value;

                reportsData.pagination.page = 1;

                await refresh();
            }
        );

        categoryButtons.forEach(
            (button) => {
                button.addEventListener(
                    "click",
                    async () => {
                        categoryButtons.forEach(
                            (item) =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                        button.classList.add(
                            "active"
                        );

                        reportsData.filters.category =
                            button.dataset.category ||
                            "";

                        reportsData.pagination.page = 1;

                        await refresh();
                    }
                );
            }
        );

        builderForm.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                alertBox.className =
                    "alert d-none";

                try {
                    const payload =
                        reportsForm.getPayload();

                    if (
                        !payload.name ||
                        !payload.category ||
                        !payload.reportType
                    ) {
                        throw new Error(
                            "Please complete all required fields."
                        );
                    }

                    if (
                        !payload.dateRange.from ||
                        !payload.dateRange.to
                    ) {
                        throw new Error(
                            "Please select the report date range."
                        );
                    }

                    if (
                        payload.dateRange.from >
                        payload.dateRange.to
                    ) {
                        throw new Error(
                            "The start date cannot be after the end date."
                        );
                    }

                    const button =
                        document.getElementById(
                            "generateReport"
                        );

                    button.disabled = true;

                    button.innerHTML = `
                        <span
                            class="spinner-border spinner-border-sm me-1"
                        ></span>
                        Generating...
                    `;

                    await reportsAPI.createReport(
                        payload
                    );

                    alertBox.className =
                        "alert alert-success";

                    alertBox.textContent =
                        "Report generated successfully.";

                    await refresh();

                    setTimeout(
                        () => modal.hide(),
                        600
                    );

                    button.disabled = false;

                    button.innerHTML = `
                        <i class="bi bi-file-earmark-bar-graph"></i>
                        Generate Report
                    `;
                } catch (error) {
                    console.error(
                        "Report generation failed:",
                        error
                    );

                    alertBox.className =
                        "alert alert-danger";

                    alertBox.textContent =
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to generate report.";

                    const button =
                        document.getElementById(
                            "generateReport"
                        );

                    button.disabled = false;

                    button.innerHTML = `
                        <i class="bi bi-file-earmark-bar-graph"></i>
                        Generate Report
                    `;
                }
            }
        );

        document.addEventListener(
            "click",
            async (event) => {
                const deleteButton =
                    event.target.closest(
                        "[data-delete-id]"
                    );

                if (deleteButton) {
                    const id =
                        deleteButton.dataset.deleteId;

                    const confirmed =
                        window.confirm(
                            "Delete this report?\n\nThis action cannot be undone."
                        );

                    if (!confirmed) {
                        return;
                    }

                    try {
                        await reportsAPI.deleteReport(
                            id
                        );

                        await refresh();
                    } catch (error) {
                        console.error(
                            "Delete report failed:",
                            error
                        );

                        window.alert(
                            error.response?.data?.message ||
                            "Unable to delete report."
                        );
                    }

                    return;
                }

                const exportButton =
                    event.target.closest(
                        "[data-export-id]"
                    );

                if (exportButton) {
                    const id =
                        exportButton.dataset.exportId;

                    const report =
                        reportsData.reports.find(
                            (item) =>
                                item._id === id
                        );

                    try {
                        await reportsExport.exportCSV(
                            report
                        );
                    } catch (error) {
                        window.alert(
                            error.message ||
                            "Export could not be completed."
                        );
                    }
                }
            }
        );

        await refresh();
    }
);