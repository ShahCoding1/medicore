/**
 * MediCore — Billing Form Layer
 * --------------------------------
 * Handles:
 * - Create invoice form
 * - Edit invoice form
 * - Dynamic invoice items
 * - Patient selection
 * - Financial calculations
 * - Form validation
 * - API save operations
 *
 * Phase 14 — Billing
 */

(function () {
    "use strict";

    const dataLayer = window.mediCoreBillingData;
    const ui = window.mediCoreBillingUI;

    if (!dataLayer || !ui) {
        console.error(
            "MediCore Billing dependencies are not available."
        );
        return;
    }

    const state = {
        mode: "create",
        editingInvoiceId: null,
        patients: [],
        itemIndex: 0
    };

    const elements = {};

    /**
     * Cache form elements.
     */
    function cacheElements() {
        elements.modal =
            document.getElementById("invoiceModal");

        elements.modalLabel =
            document.getElementById(
                "invoiceModalLabel"
            );

        elements.form =
            document.getElementById("invoiceForm");

        elements.alert =
            document.getElementById(
                "invoiceFormAlert"
            );

        elements.invoiceNumber =
            document.getElementById(
                "invoiceNumber"
            );

        elements.patient =
            document.getElementById(
                "invoicePatient"
            );

        elements.invoiceDate =
            document.getElementById(
                "invoiceDate"
            );

        elements.dueDate =
            document.getElementById(
                "invoiceDueDate"
            );

        elements.paymentMethod =
            document.getElementById(
                "invoicePaymentMethod"
            );

        elements.itemsContainer =
            document.getElementById(
                "invoiceItemsContainer"
            );

        elements.addItemButton =
            document.getElementById(
                "addInvoiceItemBtn"
            );

        elements.discount =
            document.getElementById(
                "invoiceDiscount"
            );

        elements.tax =
            document.getElementById(
                "invoiceTax"
            );

        elements.paidAmount =
            document.getElementById(
                "invoicePaidAmount"
            );

        elements.subtotalPreview =
            document.getElementById(
                "invoiceSubtotalPreview"
            );

        elements.discountPreview =
            document.getElementById(
                "invoiceDiscountPreview"
            );

        elements.taxPreview =
            document.getElementById(
                "invoiceTaxPreview"
            );

        elements.totalPreview =
            document.getElementById(
                "invoiceTotalPreview"
            );

        elements.paidPreview =
            document.getElementById(
                "invoicePaidPreview"
            );

        elements.balancePreview =
            document.getElementById(
                "invoiceBalancePreview"
            );

        elements.notes =
            document.getElementById(
                "invoiceNotes"
            );

        elements.saveButton =
            document.getElementById(
                "saveInvoiceBtn"
            );

        elements.saveSpinner =
            document.getElementById(
                "saveInvoiceSpinner"
            );

        elements.saveIcon =
            document.getElementById(
                "saveInvoiceIcon"
            );

        elements.saveText =
            document.getElementById(
                "saveInvoiceText"
            );
    }

    /**
     * Generate today's date in YYYY-MM-DD.
     */
    function getTodayDate() {
        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /**
     * Generate a default due date.
     */
    function getDefaultDueDate(days = 7) {
        const date = new Date();

        date.setDate(
            date.getDate() + days
        );

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /**
     * Generate a temporary invoice number.
     *
     * The backend remains responsible for uniqueness.
     */
    function generateInvoiceNumber() {
        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        const random =
            Math.floor(
                1000 +
                Math.random() * 9000
            );

        return `INV-${year}${month}${day}-${random}`;
    }

    /**
     * Show form alert.
     */
    function showAlert(
        message,
        type = "danger"
    ) {
        if (!elements.alert) {
            return;
        }

        elements.alert.className =
            `alert alert-${type} d-flex align-items-start gap-2`;

        elements.alert.innerHTML = `
            <i class="bi ${
                type === "success"
                    ? "bi-check-circle-fill"
                    : "bi-exclamation-circle-fill"
            } mt-1"></i>

            <div>
                ${ui.escapeHtml(message)}
            </div>
        `;

        elements.alert.classList.remove(
            "d-none"
        );
    }

    /**
     * Hide form alert.
     */
    function hideAlert() {
        if (!elements.alert) {
            return;
        }

        elements.alert.classList.add(
            "d-none"
        );

        elements.alert.textContent = "";
    }

    /**
     * Set save button state.
     */
    function setSavingState(
        saving
    ) {
        if (!elements.saveButton) {
            return;
        }

        elements.saveButton.disabled =
            saving;

        if (elements.saveSpinner) {
            elements.saveSpinner.classList.toggle(
                "d-none",
                !saving
            );
        }

        if (elements.saveIcon) {
            elements.saveIcon.classList.toggle(
                "d-none",
                saving
            );
        }

        if (elements.saveText) {
            elements.saveText.textContent =
                saving
                    ? "Saving..."
                    : state.mode === "edit"
                        ? "Update Invoice"
                        : "Create Invoice";
        }
    }

    /**
     * Get item rows.
     */
    function getItemRows() {
        if (!elements.itemsContainer) {
            return [];
        }

        return Array.from(
            elements.itemsContainer.querySelectorAll(
                ".invoice-item-row"
            )
        );
    }

    /**
     * Add one invoice item row.
     */
    function addItem(item = {}) {
        if (!elements.itemsContainer) {
            return;
        }

        state.itemIndex += 1;

        const row =
            document.createElement("div");

        row.className =
            "invoice-item-row";

        row.dataset.itemIndex =
            String(state.itemIndex);

        row.innerHTML = `
            <div class="invoice-item-description">
                <label class="form-label">
                    Description
                </label>

                <input
                    type="text"
                    class="form-control invoice-item-description-input"
                    placeholder="e.g. Consultation"
                    value="${ui.escapeHtml(
                        item.description || ""
                    )}"
                    autocomplete="off"
                >
            </div>

            <div class="invoice-item-quantity">
                <label class="form-label">
                    Qty
                </label>

                <input
                    type="number"
                    class="form-control invoice-item-quantity-input"
                    min="1"
                    step="1"
                    value="${Math.max(
                        1,
                        Number(
                            item.quantity
                        ) || 1
                    )}"
                >
            </div>

            <div class="invoice-item-price">
                <label class="form-label">
                    Unit Price
                </label>

                <input
                    type="number"
                    class="form-control invoice-item-price-input"
                    min="0"
                    step="0.01"
                    value="${Number(
                        item.unitPrice
                    ) || 0}"
                >
            </div>

            <div class="invoice-item-total">
                <label class="form-label">
                    Amount
                </label>

                <div class="invoice-item-amount">
                    ${dataLayer.formatCurrency(
                        dataLayer.calculateItemAmount(
                            item.quantity || 1,
                            item.unitPrice || 0
                        )
                    )}
                </div>
            </div>

            <div class="invoice-item-remove">
                <label class="form-label d-block">
                    &nbsp;
                </label>

                <button
                    type="button"
                    class="btn btn-outline-danger invoice-remove-item"
                    title="Remove item"
                    aria-label="Remove invoice item"
                >
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        `;

        elements.itemsContainer.appendChild(
            row
        );

        bindItemRow(row);

        calculateTotals();
    }

    /**
     * Bind one item row.
     */
    function bindItemRow(row) {
        if (!row) {
            return;
        }

        const quantity =
            row.querySelector(
                ".invoice-item-quantity-input"
            );

        const price =
            row.querySelector(
                ".invoice-item-price-input"
            );

        const remove =
            row.querySelector(
                ".invoice-remove-item"
            );

        if (quantity) {
            quantity.addEventListener(
                "input",
                () => {
                    calculateRowAmount(row);
                    calculateTotals();
                }
            );

            quantity.addEventListener(
                "change",
                () => {
                    const value =
                        Number(
                            quantity.value
                        );

                    if (
                        !Number.isFinite(value) ||
                        value < 1
                    ) {
                        quantity.value = "1";
                    }

                    calculateRowAmount(row);
                    calculateTotals();
                }
            );
        }

        if (price) {
            price.addEventListener(
                "input",
                () => {
                    calculateRowAmount(row);
                    calculateTotals();
                }
            );

            price.addEventListener(
                "change",
                () => {
                    const value =
                        Number(
                            price.value
                        );

                    if (
                        !Number.isFinite(value) ||
                        value < 0
                    ) {
                        price.value = "0";
                    }

                    calculateRowAmount(row);
                    calculateTotals();
                }
            );
        }

        if (remove) {
            remove.addEventListener(
                "click",
                () => {
                    removeItem(row);
                }
            );
        }
    }

    /**
     * Calculate one row amount.
     */
    function calculateRowAmount(row) {
        if (!row) {
            return 0;
        }

        const quantity =
            Number(
                row.querySelector(
                    ".invoice-item-quantity-input"
                )?.value
            ) || 0;

        const unitPrice =
            Number(
                row.querySelector(
                    ".invoice-item-price-input"
                )?.value
            ) || 0;

        const amount =
            dataLayer.calculateItemAmount(
                quantity,
                unitPrice
            );

        const amountElement =
            row.querySelector(
                ".invoice-item-amount"
            );

        if (amountElement) {
            amountElement.textContent =
                dataLayer.formatCurrency(
                    amount
                );
        }

        return amount;
    }

    /**
     * Remove an item row.
     */
    function removeItem(row) {
        const rows =
            getItemRows();

        if (rows.length <= 1) {
            const description =
                row.querySelector(
                    ".invoice-item-description-input"
                );

            const quantity =
                row.querySelector(
                    ".invoice-item-quantity-input"
                );

            const price =
                row.querySelector(
                    ".invoice-item-price-input"
                );

            if (description) {
                description.value = "";
            }

            if (quantity) {
                quantity.value = "1";
            }

            if (price) {
                price.value = "0";
            }

            calculateRowAmount(row);
            calculateTotals();

            return;
        }

        row.remove();

        calculateTotals();
    }

    /**
     * Collect invoice items from form.
     */
    function collectItems() {
        return getItemRows()
            .map((row) => {
                const description =
                    row.querySelector(
                        ".invoice-item-description-input"
                    )?.value.trim() || "";

                const quantity =
                    Number(
                        row.querySelector(
                            ".invoice-item-quantity-input"
                        )?.value
                    ) || 0;

                const unitPrice =
                    Number(
                        row.querySelector(
                            ".invoice-item-price-input"
                        )?.value
                    ) || 0;

                return {
                    description,
                    quantity,
                    unitPrice,
                    amount:
                        dataLayer.calculateItemAmount(
                            quantity,
                            unitPrice
                        )
                };
            })
            .filter(
                (item) =>
                    item.description ||
                    item.quantity > 0 ||
                    item.unitPrice > 0
            );
    }

    /**
     * Calculate and render financial totals.
     */
    function calculateTotals() {
        const items =
            collectItems();

        const discount =
            Number(
                elements.discount?.value
            ) || 0;

        const tax =
            Number(
                elements.tax?.value
            ) || 0;

        const paidAmount =
            Number(
                elements.paidAmount?.value
            ) || 0;

        const totals =
            dataLayer.calculateInvoiceTotals({
                items,
                discount,
                tax,
                paidAmount
            });

        if (elements.subtotalPreview) {
            elements.subtotalPreview.textContent =
                dataLayer.formatCurrency(
                    totals.subtotal
                );
        }

        if (elements.discountPreview) {
            elements.discountPreview.textContent =
                dataLayer.formatCurrency(
                    totals.discount
                );
        }

        if (elements.taxPreview) {
            elements.taxPreview.textContent =
                dataLayer.formatCurrency(
                    totals.tax
                );
        }

        if (elements.totalPreview) {
            elements.totalPreview.textContent =
                dataLayer.formatCurrency(
                    totals.totalAmount
                );
        }

        if (elements.paidPreview) {
            elements.paidPreview.textContent =
                dataLayer.formatCurrency(
                    totals.paidAmount
                );
        }

        if (elements.balancePreview) {
            elements.balancePreview.textContent =
                dataLayer.formatCurrency(
                    totals.balanceAmount
                );
        }

        return totals;
    }

    /**
     * Populate patient dropdown.
     */
    function populatePatients(patients = []) {
        if (!elements.patient) {
            return;
        }

        const currentValue =
            elements.patient.value;

        elements.patient.innerHTML = `
            <option value="">
                Select patient
            </option>
        `;

        patients.forEach((patient) => {
            const id =
                patient._id ||
                patient.id;

            if (!id) {
                return;
            }

            const option =
                document.createElement(
                    "option"
                );

            option.value = id;

            option.textContent =
                patient.fullName ||
                "Unnamed Patient";

            elements.patient.appendChild(
                option
            );
        });

        if (currentValue) {
            elements.patient.value =
                currentValue;
        }
    }

    /**
     * Load patients for the form.
     */
    async function loadPatients() {
        try {
            const result =
                await dataLayer.getPatients({
                    limit: 500
                });

            state.patients =
                result.patients || [];

            populatePatients(
                state.patients
            );

            return state.patients;
        } catch (error) {
            console.error(
                "Unable to load billing patients:",
                error
            );

            showAlert(
                error.message ||
                "Unable to load patients."
            );

            return [];
        }
    }

    /**
     * Reset form to create mode.
     */
    function resetForm() {
        if (!elements.form) {
            return;
        }

        elements.form.reset();

        hideAlert();

        state.mode =
            "create";

        state.editingInvoiceId =
            null;

        state.itemIndex =
            0;

        if (elements.modalLabel) {
            elements.modalLabel.textContent =
                "Create Invoice";
        }

        if (elements.invoiceNumber) {
            elements.invoiceNumber.value =
                generateInvoiceNumber();
        }

        if (elements.invoiceDate) {
            elements.invoiceDate.value =
                getTodayDate();
        }

        if (elements.dueDate) {
            elements.dueDate.value =
                getDefaultDueDate(7);
        }

        if (elements.paymentMethod) {
            elements.paymentMethod.value =
                "cash";
        }

        if (elements.discount) {
            elements.discount.value =
                "0";
        }

        if (elements.tax) {
            elements.tax.value =
                "0";
        }

        if (elements.paidAmount) {
            elements.paidAmount.value =
                "0";
        }

        if (elements.notes) {
            elements.notes.value =
                "";
        }

        if (elements.itemsContainer) {
            elements.itemsContainer.innerHTML =
                "";
        }

        addItem();

        calculateTotals();

        setSavingState(false);
    }

    /**
     * Open create invoice modal.
     */
    async function openCreateForm() {
        resetForm();

        await loadPatients();

        if (
            elements.modal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    elements.modal
                );

            modal.show();
        }
    }

    /**
     * Convert invoice patient into an ID.
     */
    function getInvoicePatientId(
        invoice
    ) {
        if (!invoice?.patient) {
            return "";
        }

        if (
            typeof invoice.patient ===
            "string"
        ) {
            return invoice.patient;
        }

        return (
            invoice.patient._id ||
            invoice.patient.id ||
            ""
        );
    }

    /**
     * Open edit invoice modal.
     */
    async function openEditForm(
        invoice
    ) {
        if (!invoice) {
            return;
        }

        resetForm();

        state.mode =
            "edit";

        state.editingInvoiceId =
            invoice._id ||
            invoice.id ||
            null;

        if (!state.editingInvoiceId) {
            showAlert(
                "This invoice cannot be edited because its ID is missing."
            );

            return;
        }

        if (elements.modalLabel) {
            elements.modalLabel.textContent =
                "Edit Invoice";
        }

        await loadPatients();

        if (elements.invoiceNumber) {
            elements.invoiceNumber.value =
                invoice.invoiceNumber || "";
        }

        if (elements.patient) {
            elements.patient.value =
                getInvoicePatientId(
                    invoice
                );
        }

        if (elements.invoiceDate) {
            elements.invoiceDate.value =
                toInputDate(
                    invoice.invoiceDate
                );
        }

        if (elements.dueDate) {
            elements.dueDate.value =
                toInputDate(
                    invoice.dueDate
                );
        }

        if (elements.paymentMethod) {
            elements.paymentMethod.value =
                invoice.paymentMethod ||
                "cash";
        }

        if (elements.discount) {
            elements.discount.value =
                Number(
                    invoice.discount
                ) || 0;
        }

        if (elements.tax) {
            elements.tax.value =
                Number(
                    invoice.tax
                ) || 0;
        }

        if (elements.paidAmount) {
            elements.paidAmount.value =
                Number(
                    invoice.paidAmount
                ) || 0;
        }

        if (elements.notes) {
            elements.notes.value =
                invoice.notes || "";
        }

        if (elements.itemsContainer) {
            elements.itemsContainer.innerHTML =
                "";

            state.itemIndex = 0;

            const items =
                Array.isArray(
                    invoice.items
                ) &&
                invoice.items.length
                    ? invoice.items
                    : [{}];

            items.forEach((item) => {
                addItem(item);
            });
        }

        calculateTotals();

        if (
            elements.modal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    elements.modal
                );

            modal.show();
        }
    }

    /**
     * Convert date to input date format.
     */
    function toInputDate(
        dateValue
    ) {
        if (!dateValue) {
            return "";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    /**
     * Validate form.
     */
    function validateForm() {
        hideAlert();

        if (!elements.form) {
            return {
                valid: false,
                message:
                    "Invoice form is unavailable."
            };
        }

        const invoiceNumber =
            elements.invoiceNumber?.value.trim();

        const patient =
            elements.patient?.value;

        const invoiceDate =
            elements.invoiceDate?.value;

        const dueDate =
            elements.dueDate?.value;

        const items =
            collectItems();

        const discount =
            Number(
                elements.discount?.value
            ) || 0;

        const tax =
            Number(
                elements.tax?.value
            ) || 0;

        const paidAmount =
            Number(
                elements.paidAmount?.value
            ) || 0;

        if (!invoiceNumber) {
            return {
                valid: false,
                message:
                    "Please enter an invoice number."
            };
        }

        if (!patient) {
            return {
                valid: false,
                message:
                    "Please select a patient."
            };
        }

        if (!invoiceDate) {
            return {
                valid: false,
                message:
                    "Please select the invoice date."
            };
        }

        if (!dueDate) {
            return {
                valid: false,
                message:
                    "Please select the due date."
            };
        }

        const invoiceDateObject =
            new Date(
                `${invoiceDate}T00:00:00`
            );

        const dueDateObject =
            new Date(
                `${dueDate}T00:00:00`
            );

        if (
            dueDateObject <
            invoiceDateObject
        ) {
            return {
                valid: false,
                message:
                    "Due date cannot be earlier than the invoice date."
            };
        }

        if (!items.length) {
            return {
                valid: false,
                message:
                    "Please add at least one invoice item."
            };
        }

        const invalidItem =
            items.find(
                (item) =>
                    !item.description ||
                    item.quantity <= 0 ||
                    item.unitPrice < 0
            );

        if (invalidItem) {
            return {
                valid: false,
                message:
                    "Each invoice item needs a description, valid quantity, and valid unit price."
            };
        }

        if (discount < 0) {
            return {
                valid: false,
                message:
                    "Discount cannot be negative."
            };
        }

        if (tax < 0) {
            return {
                valid: false,
                message:
                    "Tax cannot be negative."
            };
        }

        if (paidAmount < 0) {
            return {
                valid: false,
                message:
                    "Paid amount cannot be negative."
            };
        }

        const totals =
            dataLayer.calculateInvoiceTotals({
                items,
                discount,
                tax,
                paidAmount
            });

        if (
            paidAmount >
            totals.totalAmount
        ) {
            return {
                valid: false,
                message:
                    "Paid amount cannot be greater than the invoice total."
            };
        }

        return {
            valid: true
        };
    }

    /**
     * Build form payload.
     */
    function getFormData() {
        const items =
            collectItems();

        return dataLayer.buildInvoicePayload({
            invoiceNumber:
                elements.invoiceNumber?.value.trim(),

            patient:
                elements.patient?.value,

            invoiceDate:
                elements.invoiceDate?.value,

            dueDate:
                elements.dueDate?.value,

            items,

            discount:
                Number(
                    elements.discount?.value
                ) || 0,

            tax:
                Number(
                    elements.tax?.value
                ) || 0,

            paidAmount:
                Number(
                    elements.paidAmount?.value
                ) || 0,

            paymentMethod:
                elements.paymentMethod?.value ||
                "cash",

            notes:
                elements.notes?.value.trim() ||
                ""
        });
    }

    /**
     * Save invoice.
     */
    async function saveInvoice(
        event
    ) {
        if (event) {
            event.preventDefault();
        }

        const validation =
            validateForm();

        if (!validation.valid) {
            showAlert(
                validation.message
            );

            return;
        }

        const payload =
            getFormData();

        setSavingState(true);

        try {
            let result;

            if (
                state.mode === "edit" &&
                state.editingInvoiceId
            ) {
                result =
                    await dataLayer.updateInvoice(
                        state.editingInvoiceId,
                        payload
                    );
            } else {
                result =
                    await dataLayer.createInvoice(
                        payload
                    );
            }

            const savedInvoice =
                result.invoice;

            if (
                savedInvoice &&
                typeof window
                    .mediCoreBillingRefresh ===
                    "function"
            ) {
                await window.mediCoreBillingRefresh();
            }

            closeForm();

            ui.showToast(
                state.mode === "edit"
                    ? "Invoice updated successfully."
                    : "Invoice created successfully.",
                "success"
            );

            return result;
        } catch (error) {
            console.error(
                "Failed to save invoice:",
                error
            );

            showAlert(
                error.message ||
                "Unable to save the invoice."
            );

            throw error;
        } finally {
            setSavingState(false);
        }
    }

    /**
     * Close invoice form.
     */
    function closeForm() {
        if (
            elements.modal &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getInstance(
                    elements.modal
                );

            if (modal) {
                modal.hide();
            }
        }

        state.mode =
            "create";

        state.editingInvoiceId =
            null;
    }

    /**
     * Handle modal hidden event.
     */
    function handleModalHidden() {
        resetForm();
    }

    /**
     * Bind form events.
     */
    function bindEvents() {
        if (elements.addItemButton) {
            elements.addItemButton.addEventListener(
                "click",
                () => {
                    addItem();
                }
            );
        }

        if (elements.form) {
            elements.form.addEventListener(
                "submit",
                saveInvoice
            );
        }

        [
            elements.discount,
            elements.tax,
            elements.paidAmount
        ].forEach((element) => {
            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                calculateTotals
            );

            element.addEventListener(
                "change",
                calculateTotals
            );
        });

        if (elements.modal) {
            elements.modal.addEventListener(
                "hidden.bs.modal",
                handleModalHidden
            );
        }
    }

    /**
     * Initialize billing form.
     */
    function init() {
        cacheElements();
        bindEvents();
    }

    /**
     * Public Billing Form API.
     */
    window.mediCoreBillingForm = {
        state,

        init,
        cacheElements,

        openCreateForm,
        openEditForm,
        closeForm,

        resetForm,

        addItem,
        removeItem,

        collectItems,
        calculateTotals,

        validateForm,
        getFormData,
        saveInvoice,

        loadPatients,
        populatePatients,

        showAlert,
        hideAlert
    };
})();