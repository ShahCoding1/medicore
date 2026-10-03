const auditLogsUI = {

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

        return new Date(value).toLocaleString();
    },

    renderSummary(summary) {
        document.getElementById(
            "totalEvents"
        ).textContent =
            summary.total || 0;

        document.getElementById(
            "successfulEvents"
        ).textContent =
            summary.successful || 0;

        document.getElementById(
            "failedEvents"
        ).textContent =
            summary.failed || 0;

        document.getElementById(
            "warningEvents"
        ).textContent =
            summary.warnings || 0;
    },

    renderLogs(data) {
        const tbody =
            document.getElementById(
                "auditTableBody"
            );

        const logs = data.logs || [];

        if (!logs.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="bi bi-journal-x d-block fs-3 mb-2"></i>
                        No audit events found.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = logs.map(
            (log) => {

                const actor =
                    log.actor || {};

                const actorName =
                    `${actor.firstName || ""} ${actor.lastName || ""}`
                        .trim() ||
                    "System";

                const status =
                    log.status || "success";

                return `
                    <tr>

                        <td>
                            <div class="actor-name">
                                ${this.escape(actorName)}
                            </div>

                            <div class="actor-email">
                                ${this.escape(actor.email || "")}
                            </div>
                        </td>

                        <td>
                            <span class="module-badge">
                                ${this.escape(log.module)}
                            </span>
                        </td>

                        <td>
                            <span class="action-text">
                                ${this.escape(log.action)}
                            </span>
                        </td>

                        <td>
                            <div class="target-text">
                                ${this.escape(
                                    log.target ||
                                    log.targetType ||
                                    "—"
                                )}
                            </div>
                        </td>

                        <td>
                            <span class="status-badge status-${this.escape(status)}">
                                ${this.escape(status)}
                            </span>
                        </td>

                        <td>
                            <span class="audit-time">
                                ${this.formatDate(log.createdAt)}
                            </span>
                        </td>

                        <td class="text-end">
                            <button
                                class="btn btn-sm btn-outline-secondary view-audit"
                                data-id="${log._id}"
                                aria-label="View audit details"
                            >
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>

                    </tr>
                `;
            }
        ).join("");
    },

    renderPagination(pagination) {
        const container =
            document.getElementById(
                "auditPagination"
            );

        const current =
            pagination.page || 1;

        const pages =
            pagination.pages || 1;

        if (pages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = "";

        for (
            let page = 1;
            page <= pages;
            page++
        ) {
            html += `
                <button
                    class="audit-page-button ${page === current ? "active" : ""}"
                    data-page="${page}"
                >
                    ${page}
                </button>
            `;
        }

        container.innerHTML = html;
    },

    updateResultSummary(pagination) {
        const element =
            document.getElementById(
                "resultSummary"
            );

        element.textContent =
            `${pagination.total || 0} audit events found`;
    },

    renderDetails(log) {
        const actor =
            log.actor || {};

        const actorName =
            `${actor.firstName || ""} ${actor.lastName || ""}`
                .trim() ||
            "System";

        const previous =
            log.previousState
                ? JSON.stringify(
                    log.previousState,
                    null,
                    2
                )
                : "Not available";

        const current =
            log.newState
                ? JSON.stringify(
                    log.newState,
                    null,
                    2
                )
                : "Not available";

        return `
            <div class="audit-detail-grid">

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        Actor
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(actorName)}
                    </div>
                </div>

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        Timestamp
                    </div>

                    <div class="audit-detail-value">
                        ${this.formatDate(log.createdAt)}
                    </div>
                </div>

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        Module
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(log.module)}
                    </div>
                </div>

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        Action
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(log.action)}
                    </div>
                </div>

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        Status
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(log.status)}
                    </div>
                </div>

                <div class="audit-detail-item">
                    <div class="audit-detail-label">
                        IP Address
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(
                            log.ipAddress ||
                            "Not available"
                        )}
                    </div>
                </div>

                <div class="audit-detail-item full">
                    <div class="audit-detail-label">
                        Target
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(
                            log.target ||
                            log.targetType ||
                            "Not specified"
                        )}
                    </div>
                </div>

                <div class="audit-detail-item full">
                    <div class="audit-detail-label">
                        Previous State
                    </div>

                    <div class="state-block">
                        <pre>${this.escape(previous)}</pre>
                    </div>
                </div>

                <div class="audit-detail-item full">
                    <div class="audit-detail-label">
                        New State
                    </div>

                    <div class="state-block">
                        <pre>${this.escape(current)}</pre>
                    </div>
                </div>

                <div class="audit-detail-item full">
                    <div class="audit-detail-label">
                        User Agent
                    </div>

                    <div class="audit-detail-value">
                        ${this.escape(
                            log.userAgent ||
                            "Not available"
                        )}
                    </div>
                </div>

            </div>
        `;
    }
};