/**
 * MediCore — Billing Data Layer
 * --------------------------------
 * Handles:
 * - Invoice API communication
 * - Billing summary retrieval
 * - Patient retrieval for invoice filters/forms
 * - Invoice CRUD operations
 * - Client-side invoice normalization
 * - Financial calculations
 *
 * Phase 14 — Billing
 */

(function () {
    "use strict";

    const API = window.mediCoreAPI;

    if (!API) {
        console.error(
            "MediCore API client is not available. Make sure ../js/api.js loads first."
        );
        return;
    }

    const BILLING_ENDPOINT = "/billing";
    const PATIENT_ENDPOINT = "/patients";

    /**
     * Safely extract API payload.
     */
    function getPayload(response) {
        return response?.data || {};
    }

    /**
     * Extract an API message.
     */
    function getErrorMessage(error, fallback = "Something went wrong.") {
        return (
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            fallback
        );
    }

    /**
     * Normalize a patient object.
     */
    function normalizePatient(patient) {
        if (!patient) {
            return null;
        }

        const firstName = patient.firstName || "";
        const lastName = patient.lastName || "";

        const fullName =
            patient.fullName ||
            patient.name ||
            `${firstName} ${lastName}`.trim();

        return {
            ...patient,
            _id: patient._id || patient.id,
            id: patient.id || patient._id,
            fullName: fullName || "Unnamed Patient"
        };
    }

    /**
     * Normalize an invoice item.
     */
    function normalizeInvoiceItem(item = {}) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;

        return {
            ...item,
            description: item.description || "",
            quantity,
            unitPrice,
            amount:
                Number.isFinite(Number(item.amount))
                    ? Number(item.amount)
                    : quantity * unitPrice
        };
    }

    /**
     * Normalize invoice data for the UI.
     */
    function normalizeInvoice(invoice = {}) {
        const items = Array.isArray(invoice.items)
            ? invoice.items.map(normalizeInvoiceItem)
            : [];

        const subtotal =
            Number(invoice.subtotal) ||
            items.reduce((sum, item) => sum + item.amount, 0);

        const discount = Number(invoice.discount) || 0;
        const tax = Number(invoice.tax) || 0;
        const totalAmount =
            Number(invoice.totalAmount) ||
            Math.max(0, subtotal - discount + tax);

        const paidAmount = Number(invoice.paidAmount) || 0;

        const balanceAmount =
            Number.isFinite(Number(invoice.balanceAmount))
                ? Number(invoice.balanceAmount)
                : Math.max(0, totalAmount - paidAmount);

        return {
            ...invoice,

            _id: invoice._id || invoice.id,
            id: invoice.id || invoice._id,

            invoiceNumber:
                invoice.invoiceNumber ||
                "—",

            patient:
                typeof invoice.patient === "object"
                    ? normalizePatient(invoice.patient)
                    : invoice.patient || null,

            items,

            subtotal,
            discount,
            tax,
            totalAmount,
            paidAmount,
            balanceAmount,

            status:
                invoice.status ||
                "unpaid",

            paymentMethod:
                invoice.paymentMethod ||
                "cash",

            notes:
                invoice.notes ||
                ""
        };
    }

    /**
     * Normalize an invoice collection.
     */
    function normalizeInvoices(payload) {
        const source =
            payload?.invoices ||
            payload?.data ||
            payload?.results ||
            [];

        if (!Array.isArray(source)) {
            return [];
        }

        return source.map(normalizeInvoice);
    }

    /**
     * Calculate one invoice item.
     */
    function calculateItemAmount(quantity, unitPrice) {
        const safeQuantity = Math.max(
            0,
            Number(quantity) || 0
        );

        const safeUnitPrice = Math.max(
            0,
            Number(unitPrice) || 0
        );

        return safeQuantity * safeUnitPrice;
    }

    /**
     * Calculate invoice financial values.
     */
    function calculateInvoiceTotals({
        items = [],
        discount = 0,
        tax = 0,
        paidAmount = 0
    } = {}) {
        const normalizedItems = Array.isArray(items)
            ? items.map(normalizeInvoiceItem)
            : [];

        const subtotal = normalizedItems.reduce(
            (sum, item) => sum + calculateItemAmount(
                item.quantity,
                item.unitPrice
            ),
            0
        );

        const safeDiscount = Math.max(
            0,
            Number(discount) || 0
        );

        const safeTax = Math.max(
            0,
            Number(tax) || 0
        );

        const safePaidAmount = Math.max(
            0,
            Number(paidAmount) || 0
        );

        const totalAmount = Math.max(
            0,
            subtotal - safeDiscount + safeTax
        );

        const balanceAmount = Math.max(
            0,
            totalAmount - safePaidAmount
        );

        return {
            subtotal,
            discount: safeDiscount,
            tax: safeTax,
            totalAmount,
            paidAmount: safePaidAmount,
            balanceAmount
        };
    }

    /**
     * Determine invoice status from financial values.
     */
    function calculateInvoiceStatus({
        totalAmount = 0,
        paidAmount = 0,
        dueDate = null,
        currentDate = new Date()
    } = {}) {
        const total = Math.max(
            0,
            Number(totalAmount) || 0
        );

        const paid = Math.max(
            0,
            Number(paidAmount) || 0
        );

        if (total <= 0) {
            return "draft";
        }

        if (paid >= total) {
            return "paid";
        }

        if (paid > 0 && paid < total) {
            if (dueDate) {
                const due = new Date(dueDate);

                if (
                    !Number.isNaN(due.getTime()) &&
                    due < currentDate
                ) {
                    return "overdue";
                }
            }

            return "partially_paid";
        }

        if (dueDate) {
            const due = new Date(dueDate);

            if (
                !Number.isNaN(due.getTime()) &&
                due < currentDate
            ) {
                return "overdue";
            }
        }

        return "unpaid";
    }

    /**
     * Fetch all invoices.
     */
    async function getInvoices(params = {}) {
        try {
            const response = await API.get(
                BILLING_ENDPOINT,
                {
                    params
                }
            );

            const payload = getPayload(response);

            return {
                success: payload.success !== false,
                invoices: normalizeInvoices(payload),
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to fetch invoices:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to load invoices."
                )
            );
        }
    }

    /**
     * Fetch a single invoice.
     */
    async function getInvoice(invoiceId) {
        if (!invoiceId) {
            throw new Error(
                "Invoice ID is required."
            );
        }

        try {
            const response = await API.get(
                `${BILLING_ENDPOINT}/${invoiceId}`
            );

            const payload = getPayload(response);

            const invoice =
                payload.invoice ||
                payload.data ||
                payload;

            return {
                success: payload.success !== false,
                invoice: normalizeInvoice(invoice),
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to fetch invoice:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to load the invoice."
                )
            );
        }
    }

    /**
     * Create a new invoice.
     */
    async function createInvoice(invoiceData) {
        if (!invoiceData) {
            throw new Error(
                "Invoice data is required."
            );
        }

        try {
            const response = await API.post(
                BILLING_ENDPOINT,
                invoiceData
            );

            const payload = getPayload(response);

            const invoice =
                payload.invoice ||
                payload.data ||
                payload;

            return {
                success: payload.success !== false,
                invoice: normalizeInvoice(invoice),
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to create invoice:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to create the invoice."
                )
            );
        }
    }

    /**
     * Update an existing invoice.
     */
    async function updateInvoice(
        invoiceId,
        invoiceData
    ) {
        if (!invoiceId) {
            throw new Error(
                "Invoice ID is required."
            );
        }

        if (!invoiceData) {
            throw new Error(
                "Invoice data is required."
            );
        }

        try {
            const response = await API.put(
                `${BILLING_ENDPOINT}/${invoiceId}`,
                invoiceData
            );

            const payload = getPayload(response);

            const invoice =
                payload.invoice ||
                payload.data ||
                payload;

            return {
                success: payload.success !== false,
                invoice: normalizeInvoice(invoice),
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to update invoice:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to update the invoice."
                )
            );
        }
    }

    /**
     * Delete an invoice.
     */
    async function deleteInvoice(invoiceId) {
        if (!invoiceId) {
            throw new Error(
                "Invoice ID is required."
            );
        }

        try {
            const response = await API.delete(
                `${BILLING_ENDPOINT}/${invoiceId}`
            );

            const payload = getPayload(response);

            return {
                success: payload.success !== false,
                message:
                    payload.message ||
                    "Invoice deleted successfully.",
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to delete invoice:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to delete the invoice."
                )
            );
        }
    }

    /**
     * Fetch billing summary.
     */
    async function getBillingSummary() {
        try {
            const response = await API.get(
                `${BILLING_ENDPOINT}/summary`
            );

            const payload = getPayload(response);

            const summary =
                payload.summary ||
                payload.data ||
                {};

            return {
                success: payload.success !== false,
                summary: {
                    totalBilled:
                        Number(
                            summary.totalBilled ??
                            summary.totalAmount ??
                            0
                        ) || 0,

                    totalPaid:
                        Number(
                            summary.totalPaid ??
                            summary.paidAmount ??
                            0
                        ) || 0,

                    totalBalance:
                        Number(
                            summary.totalBalance ??
                            summary.balanceAmount ??
                            0
                        ) || 0,

                    overdueCount:
                        Number(
                            summary.overdueCount ??
                            0
                        ) || 0,

                    invoiceCount:
                        Number(
                            summary.invoiceCount ??
                            summary.totalInvoices ??
                            0
                        ) || 0,

                    ...summary
                },
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to fetch billing summary:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to load billing summary."
                )
            );
        }
    }

    /**
     * Fetch patients.
     *
     * Used by:
     * - Patient filter
     * - Invoice form
     */
    async function getPatients(params = {}) {
        try {
            const response = await API.get(
                PATIENT_ENDPOINT,
                {
                    params
                }
            );

            const payload = getPayload(response);

            const source =
                payload.patients ||
                payload.data ||
                payload.results ||
                [];

            const patients = Array.isArray(source)
                ? source.map(normalizePatient)
                : [];

            return {
                success: payload.success !== false,
                patients,
                raw: payload
            };
        } catch (error) {
            console.error(
                "Failed to fetch patients for billing:",
                error
            );

            throw new Error(
                getErrorMessage(
                    error,
                    "Unable to load patients."
                )
            );
        }
    }

    /**
     * Build an invoice payload suitable for the API.
     */
    function buildInvoicePayload(data = {}) {
        const items = Array.isArray(data.items)
            ? data.items
                .map((item) => ({
                    description:
                        String(
                            item.description || ""
                        ).trim(),

                    quantity:
                        Number(item.quantity) || 0,

                    unitPrice:
                        Number(item.unitPrice) || 0
                }))
                .filter(
                    (item) =>
                        item.description ||
                        item.quantity > 0 ||
                        item.unitPrice > 0
                )
            : [];

        const totals = calculateInvoiceTotals({
            items,
            discount: data.discount,
            tax: data.tax,
            paidAmount: data.paidAmount
        });

        return {
            invoiceNumber:
                String(
                    data.invoiceNumber || ""
                ).trim(),

            patient:
                data.patient ||
                data.patientId ||
                "",

            invoiceDate:
                data.invoiceDate || null,

            dueDate:
                data.dueDate || null,

            items,

            discount:
                totals.discount,

            tax:
                totals.tax,

            paidAmount:
                totals.paidAmount,

            paymentMethod:
                data.paymentMethod ||
                "cash",

            notes:
                String(
                    data.notes || ""
                ).trim()
        };
    }

    /**
     * Format a number as currency.
     *
     * The UI can override the currency through
     * the supplied currency argument.
     */
    function formatCurrency(
        value,
        currency = "PKR"
    ) {
        const amount = Number(value) || 0;

        try {
            return new Intl.NumberFormat(
                "en-PK",
                {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 2
                }
            ).format(amount);
        } catch (error) {
            return `${currency} ${amount.toFixed(2)}`;
        }
    }

    /**
     * Format an ISO date for display.
     */
    function formatDate(dateValue) {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);
    }

    /**
     * Public billing data API.
     */
    window.mediCoreBillingData = {
        getInvoices,
        getInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        getBillingSummary,
        getPatients,

        normalizeInvoice,
        normalizePatient,
        normalizeInvoiceItem,
        normalizeInvoices,

        buildInvoicePayload,

        calculateItemAmount,
        calculateInvoiceTotals,
        calculateInvoiceStatus,

        formatCurrency,
        formatDate,

        getErrorMessage
    };
})();