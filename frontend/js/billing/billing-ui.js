/**
 * MediCore — Billing UI Layer
 * --------------------------------
 * Handles:
 * - Invoice table rendering
 * - Summary cards
 * - Filters
 * - Status badges
 * - Empty/loading states
 * - Invoice view modal
 * - Toast notifications
 *
 * Phase 14 — Billing
 */

(function () {
    "use strict";

    const dataLayer = window.mediCoreBillingData;

    if (!dataLayer) {
        console.error(
            "MediCore Billing Data Layer is not available."
        );
        return;
    }

    const state = {
        invoices: [],
        filteredInvoices: [],
        patients: [],
        selectedInvoice: null,
        filters: {
            search: "",
            patient: "",
            status: "",
            dateFrom: "",
            dateTo: ""
        }
    };

    const elements = {};

    /**
     * Cache DOM elements.
     */
    function cacheElements() {
        elements.refreshButton =
            document.getElementById("refreshBillingBtn");

        elements.addInvoiceButton =
            document.getElementById("addInvoiceBtn");

        elements.totalBilled =
            document.getElementById("billingTotalBilled");

        elements.totalPaid =
            document.getElementById("billingTotalPaid");

        elements.totalBalance =
            document.getElementById("billingTotalBalance");

        elements.overdueCount =
            document.getElementById("billingOverdueCount");

        elements.search =
            document.getElementById("invoiceSearch");

        elements.patientFilter =
            document.getElementById("invoicePatientFilter");

        elements.statusFilter =
            document.getElementById("invoiceStatusFilter");

        elements.clearFilters =
            document.getElementById("clearInvoiceFilters");

        elements.count =
            document.getElementById("invoiceCount");

        elements.dateFrom =
            document.getElementById("invoiceDateFrom");

        elements.dateTo =
            document.getElementById("invoiceDateTo");

        elements.applyDateFilter =
            document.getElementById(
                "applyInvoiceDateFilter"
            );

        elements.tableWrapper =
            document.getElementById(
                "invoicesTableWrapper"
            );

        elements.loading =
            document.getElementById(
                "invoicesLoading"
            );

        elements.tableBody =
            document.getElementById(
                "invoicesTableBody"
            );

        elements.empty =
            document.getElementById(
                "invoicesEmpty"
            );

        elements.emptyCreate =
            document.getElementById(
                "emptyCreateInvoiceBtn"
            );

        elements.viewModal =
            document.getElementById(
                "viewInvoiceModal"
            );

        elements.invoiceDetails =
            document.getElementById(
                "invoiceDetails"
            );

        elements.toastContainer =
            document.getElementById(
                "billingToastContainer"
            );
    }

    /**
     * Escape HTML to prevent unsafe markup injection.
     */
    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Get patient display name.
     */
    function getPatientName(invoice) {
        if (!invoice?.patient) {
            return "Unknown patient";
        }

        if (typeof invoice.patient === "string") {
            return invoice.patient;
        }

        return (
            invoice.patient.fullName ||
            invoice.patient.name ||
            [
                invoice.patient.firstName,
                invoice.patient.lastName
            ]
                .filter(Boolean)
                .join(" ") ||
            "Unknown patient"
        );
    }

    /**
     * Get patient ID.
     */
    function getPatientId(invoice) {
        if (!invoice?.patient) {
            return "";
        }

        if (typeof invoice.patient === "string") {
            return invoice.patient;
        }

        return (
            invoice.patient._id ||
            invoice.patient.id ||
            ""
        );
    }

    /**
     * Get status label.
     */
    function getStatusLabel(status) {
        const labels = {
            draft: "Draft",
            unpaid: "Unpaid",
            partially_paid: "Partially Paid",
            paid: "Paid",
            overdue: "Overdue",
            cancelled: "Cancelled"
        };

        return (
            labels[status] ||
            "Unpaid"
        );
    }

    /**
     * Get status CSS class.
     */
    function getStatusClass(status) {
        const classes = {
            draft: "status-draft",
            unpaid: "status-unpaid",
            partially_paid: "status-partial",
            paid: "status-paid",
            overdue: "status-overdue",
            cancelled: "status-cancelled"
        };

        return (
            classes[status] ||
            "status-unpaid"
        );
    }

    /**
     * Get payment method label.
     */
    function getPaymentMethodLabel(method) {
        const labels = {
            cash: "Cash",
            card: "Card",
            bank_transfer: "Bank Transfer",
            online: "Online",
            insurance: "Insurance",
            other: "Other"
        };

        return (
            labels[method] ||
            "Cash"
        );
    }

    /**
     * Render summary cards.
     */
    function renderSummary(summary = {}) {
        if (elements.totalBilled) {
            elements.totalBilled.textContent =
                dataLayer.formatCurrency(
                    summary.totalBilled || 0
                );
        }

        if (elements.totalPaid) {
            elements.totalPaid.textContent =
                dataLayer.formatCurrency(
                    summary.totalPaid || 0
                );
        }

        if (elements.totalBalance) {
            elements.totalBalance.textContent =
                dataLayer.formatCurrency(
                    summary.totalBalance || 0
                );
        }

        if (elements.overdueCount) {
            elements.overdueCount.textContent =
                Number(
                    summary.overdueCount || 0
                ).toLocaleString();
        }
    }

    /**
     * Render patient filter options.
     */
    function renderPatientFilter(patients = []) {
        if (!elements.patientFilter) {
            return;
        }

        const currentValue =
            state.filters.patient ||
            elements.patientFilter.value ||
            "";

        const options = [
            `<option value="">All Patients</option>`
        ];

        patients.forEach((patient) => {
            const id =
                patient._id ||
                patient.id;

            if (!id) {
                return;
            }

            const selected =
                String(id) ===
                String(currentValue)
                    ? " selected"
                    : "";

            options.push(
                `<option value="${escapeHtml(id)}"${selected}>` +
                `${escapeHtml(patient.fullName)}` +
                `</option>`
            );
        });

        elements.patientFilter.innerHTML =
            options.join("");
    }

    /**
     * Render invoice table.
     */
    function renderInvoices(invoices = state.filteredInvoices) {
        if (!elements.tableBody) {
            return;
        }

        elements.tableBody.innerHTML = "";

        if (elements.count) {
            elements.count.textContent =
                `${invoices.length} ${
                    invoices.length === 1
                        ? "invoice"
                        : "invoices"
                }`;
        }

        if (!invoices.length) {
            showEmptyState();
            return;
        }

        hideEmptyState();

        invoices.forEach((invoice) => {
            const row =
                document.createElement("tr");

            const invoiceId =
                invoice._id ||
                invoice.id ||
                "";

            row.innerHTML = `
                <td>
                    <div class="invoice-number-cell">
                        <span class="invoice-number">
                            ${escapeHtml(
                                invoice.invoiceNumber
                            )}
                        </span>
                    </div>
                </td>

                <td>
                    <div class="patient-cell">
                        <span class="patient-name">
                            ${escapeHtml(
                                getPatientName(invoice)
                            )}
                        </span>
                    </div>
                </td>

                <td>
                    ${escapeHtml(
                        dataLayer.formatDate(
                            invoice.invoiceDate
                        )
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        dataLayer.formatDate(
                            invoice.dueDate
                        )
                    )}
                </td>

                <td>
                    <span class="invoice-amount">
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.totalAmount
                            )
                        )}
                    </span>
                </td>

                <td>
                    <span class="invoice-amount invoice-paid">
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.paidAmount
                            )
                        )}
                    </span>
                </td>

                <td>
                    <span class="invoice-amount invoice-balance">
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.balanceAmount
                            )
                        )}
                    </span>
                </td>

                <td>
                    <span class="invoice-status ${getStatusClass(
                        invoice.status
                    )}">
                        ${escapeHtml(
                            getStatusLabel(
                                invoice.status
                            )
                        )}
                    </span>
                </td>

                <td class="invoice-actions-cell">
                    <div class="invoice-actions">
                        <button
                            type="button"
                            class="btn btn-sm btn-light invoice-action-btn"
                            data-action="view"
                            data-id="${escapeHtml(
                                invoiceId
                            )}"
                            title="View invoice"
                            aria-label="View invoice"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-light invoice-action-btn"
                            data-action="edit"
                            data-id="${escapeHtml(
                                invoiceId
                            )}"
                            title="Edit invoice"
                            aria-label="Edit invoice"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-light invoice-action-btn text-danger"
                            data-action="delete"
                            data-id="${escapeHtml(
                                invoiceId
                            )}"
                            title="Delete invoice"
                            aria-label="Delete invoice"
                        >
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            `;

            elements.tableBody.appendChild(row);
        });
    }

    /**
     * Show loading state.
     */
    function showLoadingState() {
        if (elements.loading) {
            elements.loading.classList.remove(
                "d-none"
            );
        }

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.add(
                "is-loading"
            );
        }

        if (elements.empty) {
            elements.empty.classList.add(
                "d-none"
            );
        }
    }

    /**
     * Hide loading state.
     */
    function hideLoadingState() {
        if (elements.loading) {
            elements.loading.classList.add(
                "d-none"
            );
        }

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.remove(
                "is-loading"
            );
        }
    }

    /**
     * Show empty state.
     */
    function showEmptyState() {
        if (elements.empty) {
            elements.empty.classList.remove(
                "d-none"
            );
        }

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.add(
                "d-none"
            );
        }
    }

    /**
     * Hide empty state.
     */
    function hideEmptyState() {
        if (elements.empty) {
            elements.empty.classList.add(
                "d-none"
            );
        }

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.remove(
                "d-none"
            );
        }
    }

    /**
     * Apply all active filters.
     */
    function applyFilters() {
        const {
            search,
            patient,
            status,
            dateFrom,
            dateTo
        } = state.filters;

        const normalizedSearch =
            search.trim().toLowerCase();

        const fromDate =
            dateFrom
                ? new Date(`${dateFrom}T00:00:00`)
                : null;

        const toDate =
            dateTo
                ? new Date(`${dateTo}T23:59:59`)
                : null;

        state.filteredInvoices =
            state.invoices.filter((invoice) => {
                const invoiceNumber =
                    String(
                        invoice.invoiceNumber || ""
                    ).toLowerCase();

                const patientName =
                    getPatientName(invoice)
                        .toLowerCase();

                const matchesSearch =
                    !normalizedSearch ||
                    invoiceNumber.includes(
                        normalizedSearch
                    ) ||
                    patientName.includes(
                        normalizedSearch
                    );

                const invoicePatientId =
                    getPatientId(invoice);

                const matchesPatient =
                    !patient ||
                    String(invoicePatientId) ===
                    String(patient);

                const matchesStatus =
                    !status ||
                    invoice.status === status;

                const invoiceDate =
                    invoice.invoiceDate
                        ? new Date(
                            invoice.invoiceDate
                        )
                        : null;

                let matchesDate = true;

                if (
                    invoiceDate &&
                    !Number.isNaN(
                        invoiceDate.getTime()
                    )
                ) {
                    if (
                        fromDate &&
                        invoiceDate < fromDate
                    ) {
                        matchesDate = false;
                    }

                    if (
                        toDate &&
                        invoiceDate > toDate
                    ) {
                        matchesDate = false;
                    }
                } else if (
                    fromDate ||
                    toDate
                ) {
                    matchesDate = false;
                }

                return (
                    matchesSearch &&
                    matchesPatient &&
                    matchesStatus &&
                    matchesDate
                );
            });

        renderInvoices(
            state.filteredInvoices
        );
    }

    /**
     * Reset all filters.
     */
    function clearFilters() {
        state.filters = {
            search: "",
            patient: "",
            status: "",
            dateFrom: "",
            dateTo: ""
        };

        if (elements.search) {
            elements.search.value = "";
        }

        if (elements.patientFilter) {
            elements.patientFilter.value = "";
        }

        if (elements.statusFilter) {
            elements.statusFilter.value = "";
        }

        if (elements.dateFrom) {
            elements.dateFrom.value = "";
        }

        if (elements.dateTo) {
            elements.dateTo.value = "";
        }

        applyFilters();
    }

    /**
     * Render invoice details inside view modal.
     */
    function renderInvoiceDetails(invoice) {
        if (!elements.invoiceDetails) {
            return;
        }

        const items = Array.isArray(invoice.items)
            ? invoice.items
            : [];

        const itemRows = items.length
            ? items
                .map(
                    (item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                ${escapeHtml(
                                    item.description ||
                                    "Service"
                                )}
                            </td>
                            <td class="text-end">
                                ${escapeHtml(
                                    String(
                                        item.quantity
                                    )
                                )}
                            </td>
                            <td class="text-end">
                                ${escapeHtml(
                                    dataLayer.formatCurrency(
                                        item.unitPrice
                                    )
                                )}
                            </td>
                            <td class="text-end">
                                ${escapeHtml(
                                    dataLayer.formatCurrency(
                                        item.amount
                                    )
                                )}
                            </td>
                        </tr>
                    `
                )
                .join("")
            : `
                <tr>
                    <td
                        colspan="5"
                        class="text-center text-muted py-4"
                    >
                        No invoice items recorded.
                    </td>
                </tr>
            `;

        elements.invoiceDetails.innerHTML = `
            <div class="invoice-detail-header">
                <div>
                    <div class="invoice-detail-label">
                        Invoice
                    </div>

                    <h4 class="invoice-detail-number">
                        ${escapeHtml(
                            invoice.invoiceNumber
                        )}
                    </h4>
                </div>

                <span class="invoice-status ${getStatusClass(
                    invoice.status
                )}">
                    ${escapeHtml(
                        getStatusLabel(
                            invoice.status
                        )
                    )}
                </span>
            </div>

            <div class="invoice-detail-grid">
                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">
                        Patient
                    </span>
                    <strong>
                        ${escapeHtml(
                            getPatientName(invoice)
                        )}
                    </strong>
                </div>

                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">
                        Invoice Date
                    </span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatDate(
                                invoice.invoiceDate
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">
                        Due Date
                    </span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatDate(
                                invoice.dueDate
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-detail-item">
                    <span class="invoice-detail-label">
                        Payment Method
                    </span>
                    <strong>
                        ${escapeHtml(
                            getPaymentMethodLabel(
                                invoice.paymentMethod
                            )
                        )}
                    </strong>
                </div>
            </div>

            <div class="invoice-detail-section">
                <div class="table-responsive">
                    <table class="table invoice-detail-items">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th class="text-end">
                                    Qty
                                </th>
                                <th class="text-end">
                                    Unit Price
                                </th>
                                <th class="text-end">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="invoice-detail-financials">
                <div class="invoice-financial-row">
                    <span>Subtotal</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.subtotal
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-financial-row">
                    <span>Discount</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.discount
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-financial-row">
                    <span>Tax</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.tax
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-financial-row total">
                    <span>Total</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.totalAmount
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-financial-row">
                    <span>Paid</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.paidAmount
                            )
                        )}
                    </strong>
                </div>

                <div class="invoice-financial-row balance">
                    <span>Balance</span>
                    <strong>
                        ${escapeHtml(
                            dataLayer.formatCurrency(
                                invoice.balanceAmount
                            )
                        )}
                    </strong>
                </div>
            </div>

            ${
                invoice.notes
                    ? `
                        <div class="invoice-detail-notes">
                            <span class="invoice-detail-label">
                                Notes
                            </span>

                            <p>
                                ${escapeHtml(
                                    invoice.notes
                                )}
                            </p>
                        </div>
                    `
                    : ""
            }
        `;
    }

    /**
     * Open the invoice view modal.
     */
    function openInvoiceView(invoice) {
        if (!invoice) {
            return;
        }

        state.selectedInvoice = invoice;

        renderInvoiceDetails(invoice);

        if (
            elements.viewModal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    elements.viewModal
                );

            modal.show();
        }
    }

    /**
     * Close invoice view modal.
     */
    function closeInvoiceView() {
        if (
            elements.viewModal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getInstance(
                    elements.viewModal
                );

            if (modal) {
                modal.hide();
            }
        }

        state.selectedInvoice = null;
    }

    /**
     * Find invoice by ID.
     */
    function findInvoice(invoiceId) {
        return state.invoices.find(
            (invoice) =>
                String(
                    invoice._id ||
                    invoice.id
                ) === String(invoiceId)
        );
    }

    /**
     * Show toast notification.
     */
    function showToast(
        message,
        type = "success"
    ) {
        if (!elements.toastContainer) {
            return;
        }

        const allowedTypes = [
            "success",
            "danger",
            "warning",
            "info"
        ];

        const toastType =
            allowedTypes.includes(type)
                ? type
                : "info";

        const iconMap = {
            success: "bi-check-circle-fill",
            danger: "bi-exclamation-circle-fill",
            warning: "bi-exclamation-triangle-fill",
            info: "bi-info-circle-fill"
        };

        const toast =
            document.createElement("div");

        toast.className =
            `toast align-items-center border-0 billing-toast billing-toast-${toastType}`;

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
                    <i class="bi ${
                        iconMap[toastType]
                    } me-2"></i>
                    ${escapeHtml(message)}
                </div>

                <button
                    type="button"
                    class="btn-close me-2 m-auto"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>
            </div>
        `;

        elements.toastContainer.appendChild(
            toast
        );

        if (window.bootstrap) {
            const instance =
                new bootstrap.Toast(
                    toast,
                    {
                        delay: 3500
                    }
                );

            instance.show();

            toast.addEventListener(
                "hidden.bs.toast",
                () => {
                    toast.remove();
                }
            );
        } else {
            setTimeout(() => {
                toast.remove();
            }, 3500);
        }
    }

    /**
     * Set refresh button state.
     */
    function setRefreshLoading(
        loading
    ) {
        if (!elements.refreshButton) {
            return;
        }

        const icon =
            elements.refreshButton.querySelector(
                "i"
            );

        const text =
            elements.refreshButton.querySelector(
                ".refresh-btn-text"
            );

        elements.refreshButton.disabled =
            loading;

        if (icon) {
            icon.classList.toggle(
                "spin",
                loading
            );
        }

        if (text) {
            text.textContent =
                loading
                    ? "Refreshing..."
                    : "Refresh";
        }
    }

    /**
     * Public UI API.
     */
    window.mediCoreBillingUI = {
        state,
        elements,

        cacheElements,

        renderSummary,
        renderPatientFilter,
        renderInvoices,
        renderInvoiceDetails,

        showLoadingState,
        hideLoadingState,
        showEmptyState,
        hideEmptyState,

        applyFilters,
        clearFilters,

        openInvoiceView,
        closeInvoiceView,

        findInvoice,

        showToast,
        setRefreshLoading,

        getPatientName,
        getPatientId,
        getStatusLabel,
        getStatusClass,
        getPaymentMethodLabel,

        escapeHtml
    };
})();