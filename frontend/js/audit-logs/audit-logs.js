document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const modalElement =
            document.getElementById(
                "auditDetailsModal"
            );

        const detailsModal =
            new bootstrap.Modal(
                modalElement
            );

        function collectFilters() {
            auditLogsData.filters = {
                user:
                    document.getElementById(
                        "userFilter"
                    ).value.trim(),

                module:
                    document.getElementById(
                        "moduleFilter"
                    ).value,

                action:
                    document.getElementById(
                        "actionFilter"
                    ).value,

                status:
                    document.getElementById(
                        "statusFilter"
                    ).value,

                from:
                    document.getElementById(
                        "fromFilter"
                    ).value,

                to:
                    document.getElementById(
                        "toFilter"
                    ).value,

                search:
                    document.getElementById(
                        "searchFilter"
                    ).value.trim()
            };

            auditLogsData.pagination.page = 1;
        }

        async function refresh() {
            try {
                const data =
                    await auditLogsAPI.loadLogs();

                auditLogsUI.renderLogs(data);

                auditLogsUI.renderPagination(
                    data.pagination
                );

                auditLogsUI.updateResultSummary(
                    data.pagination
                );

                const summary =
                    await auditLogsAPI.loadSummary();

                auditLogsUI.renderSummary(
                    summary
                );
            } catch (error) {
                console.error(
                    "Audit logs load failed:",
                    error
                );

                document.getElementById(
                    "auditTableBody"
                ).innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            Failed to load audit logs.
                        </td>
                    </tr>
                `;
            }
        }

        document
            .getElementById("applyFilters")
            .addEventListener(
                "click",
                async () => {
                    collectFilters();
                    await refresh();
                }
            );

        document
            .getElementById("clearFilters")
            .addEventListener(
                "click",
                async () => {

                    [
                        "userFilter",
                        "searchFilter",
                        "fromFilter",
                        "toFilter"
                    ].forEach((id) => {
                        document.getElementById(
                            id
                        ).value = "";
                    });

                    document.getElementById(
                        "moduleFilter"
                    ).value = "";

                    document.getElementById(
                        "actionFilter"
                    ).value = "";

                    document.getElementById(
                        "statusFilter"
                    ).value = "";

                    collectFilters();

                    await refresh();
                }
            );

        document
            .getElementById("refreshLogs")
            .addEventListener(
                "click",
                refresh
            );

        document
            .getElementById("searchFilter")
            .addEventListener(
                "keydown",
                async (event) => {
                    if (event.key === "Enter") {
                        collectFilters();
                        await refresh();
                    }
                }
            );

        document
            .getElementById("auditPagination")
            .addEventListener(
                "click",
                async (event) => {

                    const button =
                        event.target.closest(
                            "[data-page]"
                        );

                    if (!button) {
                        return;
                    }

                    auditLogsData.pagination.page =
                        Number(
                            button.dataset.page
                        );

                    await refresh();
                }
            );

        document
            .getElementById("auditTableBody")
            .addEventListener(
                "click",
                async (event) => {

                    const button =
                        event.target.closest(
                            ".view-audit"
                        );

                    if (!button) {
                        return;
                    }

                    try {
                        const log =
                            await auditLogsAPI.getLog(
                                button.dataset.id
                            );

                        document.getElementById(
                            "auditDetailsBody"
                        ).innerHTML =
                            auditLogsUI.renderDetails(
                                log
                            );

                        detailsModal.show();
                    } catch (error) {
                        console.error(
                            "Audit detail load failed:",
                            error
                        );
                    }
                }
            );

        await refresh();
    }
);