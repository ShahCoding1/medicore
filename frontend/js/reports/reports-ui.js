const reportsUI = {
    escape(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    },

    formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    },

    formatCategory(value) {
        if (!value) {
            return "—";
        }

        return value
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    },

    statusBadge(status) {
        const labels = {
            generating: "Generating",
            ready: "Ready",
            failed: "Failed",
            expired: "Expired"
        };

        return `
            <span class="status-badge status-${this.escape(status)}">
                ${this.escape(labels[status] || status)}
            </span>
        `;
    },

    render(reports) {
        const body =
            document.getElementById(
                "reportsTableBody"
            );

        if (!body) {
            return;
        }

        if (!reports.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i class="bi bi-file-earmark-bar-graph"></i>
                            </div>

                            <h5>No reports found</h5>

                            <p>
                                Create a report using the Report Builder.
                            </p>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML = reports
            .map((report) => {
                const isReady =
                    report.status === "ready";

                return `
                    <tr>

                        <td>
                            <div class="report-name">
                                ${this.escape(report.name)}
                            </div>
                        </td>

                        <td>
                            ${this.escape(
                                this.formatCategory(
                                    report.category
                                )
                            )}
                        </td>

                        <td>
                            ${this.escape(
                                report.reportType
                            )}
                        </td>

                        <td>
                            ${this.formatDate(
                                report.dateRange?.from
                            )}
                            –
                            ${this.formatDate(
                                report.dateRange?.to
                            )}
                        </td>

                        <td>
                            ${this.statusBadge(
                                report.status
                            )}
                        </td>

                        <td>
                            ${this.formatDate(
                                report.createdAt
                            )}
                        </td>

                        <td class="text-end">

                            <div class="btn-group btn-group-sm">

                                ${
                                    isReady
                                        ? `
                                    <button
                                        type="button"
                                        class="btn btn-outline-primary"
                                        title="Export CSV"
                                        data-export-id="${this.escape(
                                            report._id
                                        )}"
                                    >
                                        <i class="bi bi-download"></i>
                                    </button>
                                    `
                                        : ""
                                }

                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    title="Delete"
                                    data-delete-id="${this.escape(
                                        report._id
                                    )}"
                                >
                                    <i class="bi bi-trash"></i>
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            })
            .join("");
    },

    showLoading() {
        const body =
            document.getElementById(
                "reportsTableBody"
            );

        if (!body) {
            return;
        }

        body.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="table-state">
                        <div class="spinner-border spinner-border-sm"></div>
                        <span>Loading reports...</span>
                    </div>
                </td>
            </tr>
        `;
    },

    showError(message) {
        const body =
            document.getElementById(
                "reportsTableBody"
            );

        if (!body) {
            return;
        }

        body.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">

                        <div class="empty-state-icon">
                            <i class="bi bi-exclamation-triangle"></i>
                        </div>

                        <h5>Unable to load reports</h5>

                        <p>
                            ${this.escape(message)}
                        </p>

                    </div>
                </td>
            </tr>
        `;
    }
};