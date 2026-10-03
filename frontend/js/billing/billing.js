/**
 * MediCore — Billing Controller
 * --------------------------------
 * Coordinates:
 * - Billing data
 * - Billing UI
 * - Billing form
 * - Invoice loading
 * - Summary loading
 * - Search and filters
 * - View / edit / delete actions
 * - Refresh workflow
 *
 * Phase 14 — Billing
 */

(function () {
    "use strict";

    const dataLayer =
        window.mediCoreBillingData;

    const ui =
        window.mediCoreBillingUI;

    const form =
        window.mediCoreBillingForm;

    if (!dataLayer || !ui || !form) {
        console.error(
            "MediCore Billing dependencies are missing."
        );
        return;
    }

    const state = ui.state;

    /**
     * Load all billing data.
     */
    async function loadBilling() {
        ui.showLoadingState();
        ui.setRefreshLoading(true);

        try {
            const [
                invoiceResult,
                summaryResult,
                patientResult
            ] = await Promise.all([
                dataLayer.getInvoices(),
                dataLayer.getBillingSummary(),
                dataLayer.getPatients({
                    limit: 500
                })
            ]);

            state.invoices =
                invoiceResult.invoices || [];

            state.filteredInvoices =
                [...state.invoices];

            state.patients =
                patientResult.patients || [];

            ui.renderSummary(
                summaryResult.summary || {}
            );

            ui.renderPatientFilter(
                state.patients
            );

            ui.applyFilters();

            return {
                invoices:
                    state.invoices,
                summary:
                    summaryResult.summary || {},
                patients:
                    state.patients
            };
        } catch (error) {
            console.error(
                "Failed to load billing data:",
                error
            );

            state.invoices = [];
            state.filteredInvoices = [];

            ui.renderSummary({
                totalBilled: 0,
                totalPaid: 0,
                totalBalance: 0,
                overdueCount: 0
            });

            ui.renderInvoices([]);

            ui.showToast(
                error.message ||
                "Unable to load billing data.",
                "danger"
            );

            throw error;
        } finally {
            ui.hideLoadingState();
            ui.setRefreshLoading(false);
        }
    }

    /**
     * Public refresh function.
     *
     * Used by billing-form.js after
     * creating or updating an invoice.
     */
    async function refreshBilling() {
        try {
            await loadBilling();
        } catch (error) {
            console.warn(
                "Billing refresh completed with an error:",
                error
            );
        }
    }

    /**
     * Handle invoice table actions.
     */
    async function handleInvoiceAction(
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

        const invoiceId =
            button.dataset.id;

        if (!invoiceId) {
            return;
        }

        const invoice =
            ui.findInvoice(
                invoiceId
            );

        if (!invoice) {
            ui.showToast(
                "Invoice could not be found.",
                "warning"
            );

            return;
        }

        switch (action) {
            case "view":
                await handleViewInvoice(
                    invoice
                );
                break;

            case "edit":
                await handleEditInvoice(
                    invoice
                );
                break;

            case "delete":
                await handleDeleteInvoice(
                    invoice
                );
                break;

            default:
                break;
        }
    }

    /**
     * View invoice.
     */
    async function handleViewInvoice(
        invoice
    ) {
        try {
            const invoiceId =
                invoice._id ||
                invoice.id;

            if (invoiceId) {
                const result =
                    await dataLayer.getInvoice(
                        invoiceId
                    );

                ui.openInvoiceView(
                    result.invoice ||
                    invoice
                );
            } else {
                ui.openInvoiceView(
                    invoice
                );
            }
        } catch (error) {
            console.error(
                "Unable to load invoice:",
                error
            );

            ui.showToast(
                error.message ||
                "Unable to load invoice details.",
                "danger"
            );
        }
    }

    /**
     * Edit invoice.
     */
    async function handleEditInvoice(
        invoice
    ) {
        try {
            const invoiceId =
                invoice._id ||
                invoice.id;

            let editableInvoice =
                invoice;

            if (invoiceId) {
                try {
                    const result =
                        await dataLayer.getInvoice(
                            invoiceId
                        );

                    editableInvoice =
                        result.invoice ||
                        invoice;
                } catch (error) {
                    console.warn(
                        "Using table invoice data for editing:",
                        error
                    );
                }
            }

            await form.openEditForm(
                editableInvoice
            );
        } catch (error) {
            console.error(
                "Unable to open edit form:",
                error
            );

            ui.showToast(
                error.message ||
                "Unable to edit invoice.",
                "danger"
            );
        }
    }

    /**
     * Delete invoice.
     */
    async function handleDeleteInvoice(
        invoice
    ) {
        const invoiceId =
            invoice._id ||
            invoice.id;

        if (!invoiceId) {
            ui.showToast(
                "Invoice ID is missing.",
                "danger"
            );

            return;
        }

        const invoiceNumber =
            invoice.invoiceNumber ||
            "this invoice";

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${invoiceNumber}? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            await dataLayer.deleteInvoice(
                invoiceId
            );

            ui.showToast(
                "Invoice deleted successfully.",
                "success"
            );

            await refreshBilling();
        } catch (error) {
            console.error(
                "Unable to delete invoice:",
                error
            );

            ui.showToast(
                error.message ||
                "Unable to delete invoice.",
                "danger"
            );
        }
    }

    /**
     * Handle search.
     */
    function handleSearch(event) {
        state.filters.search =
            event.target.value || "";

        ui.applyFilters();
    }

    /**
     * Handle patient filter.
     */
    function handlePatientFilter(event) {
        state.filters.patient =
            event.target.value || "";

        ui.applyFilters();
    }

    /**
     * Handle status filter.
     */
    function handleStatusFilter(event) {
        state.filters.status =
            event.target.value || "";

        ui.applyFilters();
    }

    /**
     * Handle date filter.
     */
    function handleDateFilter() {
        state.filters.dateFrom =
            document.getElementById(
                "invoiceDateFrom"
            )?.value || "";

        state.filters.dateTo =
            document.getElementById(
                "invoiceDateTo"
            )?.value || "";

        ui.applyFilters();
    }

    /**
     * Bind page-level events.
     */
    function bindEvents() {
        if (ui.elements.refreshButton) {
            ui.elements.refreshButton.addEventListener(
                "click",
                refreshBilling
            );
        }

        if (ui.elements.addInvoiceButton) {
            ui.elements.addInvoiceButton.addEventListener(
                "click",
                () => {
                    form.openCreateForm();
                }
            );
        }

        if (ui.elements.emptyCreate) {
            ui.elements.emptyCreate.addEventListener(
                "click",
                () => {
                    form.openCreateForm();
                }
            );
        }

        if (ui.elements.search) {
            ui.elements.search.addEventListener(
                "input",
                handleSearch
            );
        }

        if (ui.elements.patientFilter) {
            ui.elements.patientFilter.addEventListener(
                "change",
                handlePatientFilter
            );
        }

        if (ui.elements.statusFilter) {
            ui.elements.statusFilter.addEventListener(
                "change",
                handleStatusFilter
            );
        }

        if (ui.elements.clearFilters) {
            ui.elements.clearFilters.addEventListener(
                "click",
                () => {
                    ui.clearFilters();
                }
            );
        }

        if (ui.elements.applyDateFilter) {
            ui.elements.applyDateFilter.addEventListener(
                "click",
                handleDateFilter
            );
        }

        if (ui.elements.dateFrom) {
            ui.elements.dateFrom.addEventListener(
                "change",
                handleDateFilter
            );
        }

        if (ui.elements.dateTo) {
            ui.elements.dateTo.addEventListener(
                "change",
                handleDateFilter
            );
        }

        if (ui.elements.tableBody) {
            ui.elements.tableBody.addEventListener(
                "click",
                handleInvoiceAction
            );
        }
    }

    /**
     * Initialize Billing.
     */
    async function initBilling() {
        ui.cacheElements();
        form.init();

        bindEvents();

        window.mediCoreBillingRefresh =
            refreshBilling;

        await loadBilling();
    }

    /**
     * Initialize when DOM is ready.
     */
    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initBilling
        );
    } else {
        initBilling();
    }

    /**
     * Public controller API.
     */
    window.mediCoreBilling = {
        state,

        init:
            initBilling,

        load:
            loadBilling,

        refresh:
            refreshBilling,

        handleViewInvoice,
        handleEditInvoice,
        handleDeleteInvoice,

        handleSearch,
        handlePatientFilter,
        handleStatusFilter,
        handleDateFilter
    };
})();