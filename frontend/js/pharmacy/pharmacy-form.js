/* =========================================================
   MEDICORE — PHARMACY INVENTORY FORM
   Phase 12 — Pharmacy Inventory
   ========================================================= */

(function () {
    "use strict";

    const data = window.mediCorePharmacyData;
    const ui = window.mediCorePharmacyUI;

    if (!data || !ui) {
        console.error(
            "MediCore Pharmacy data/UI modules are not available."
        );
        return;
    }

    const state = {
        editingId: null
    };


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    function getModal() {
        const modalElement =
            getElement("inventoryModal");

        if (
            !modalElement ||
            !window.bootstrap
        ) {
            return null;
        }

        return bootstrap.Modal.getOrCreateInstance(
            modalElement
        );
    }


    /* =====================================================
       FORM RESET
       ===================================================== */

    function resetForm() {

        const form =
            getElement("inventoryForm");

        if (form) {
            form.reset();
        }

        state.editingId = null;

        const modalLabel =
            getElement("inventoryModalLabel");

        if (modalLabel) {
            modalLabel.textContent =
                "Add Medicine";
        }

        clearFormAlert();

        setSaveButtonState(false);

        const status =
            getElement("inventoryStatus");

        if (status) {
            status.value = "active";
        }

        const unit =
            getElement("inventoryUnit");

        if (unit) {
            unit.value = "units";
        }
    }


    /* =====================================================
       FIELD HELPERS
       ===================================================== */

    function setValue(
        id,
        value
    ) {
        const element =
            getElement(id);

        if (element) {
            element.value =
                value ?? "";
        }
    }


    function getValue(id) {
        const element =
            getElement(id);

        return element
            ? element.value.trim()
            : "";
    }


    function getNumberValue(id) {
        const value =
            getValue(id);

        if (value === "") {
            return null;
        }

        const number =
            Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }


    /* =====================================================
       ALERT
       ===================================================== */

    function showFormAlert(
        message,
        type = "danger"
    ) {

        const alert =
            getElement(
                "inventoryFormAlert"
            );

        if (!alert) {
            return;
        }

        alert.className =
            `alert alert-${type}`;

        alert.innerHTML = `
            <div class="d-flex align-items-start gap-2">
                <i class="bi ${
                    type === "success"
                        ? "bi-check-circle"
                        : "bi-exclamation-circle"
                }"></i>
                <div>${escapeHtml(message)}</div>
            </div>
        `;

        alert.classList.remove("d-none");
    }


    function clearFormAlert() {

        const alert =
            getElement(
                "inventoryFormAlert"
            );

        if (!alert) {
            return;
        }

        alert.classList.add("d-none");
        alert.textContent = "";
    }


    function escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateForm() {

        const medicineName =
            getValue(
                "inventoryMedicineName"
            );

        const category =
            getValue(
                "inventoryCategory"
            );

        const batchNumber =
            getValue(
                "inventoryBatchNumber"
            );

        const expiryDate =
            getValue(
                "inventoryExpiryDate"
            );

        const quantity =
            getNumberValue(
                "inventoryQuantity"
            );

        const reorderLevel =
            getNumberValue(
                "inventoryReorderLevel"
            );

        const purchasePrice =
            getNumberValue(
                "inventoryPurchasePrice"
            );

        const sellingPrice =
            getNumberValue(
                "inventorySellingPrice"
            );


        if (!medicineName) {
            return {
                valid: false,
                message:
                    "Medicine name is required."
            };
        }


        if (medicineName.length < 2) {
            return {
                valid: false,
                message:
                    "Medicine name must contain at least 2 characters."
            };
        }


        if (!category) {
            return {
                valid: false,
                message:
                    "Please select a medicine category."
            };
        }


        if (!batchNumber) {
            return {
                valid: false,
                message:
                    "Batch number is required."
            };
        }


        if (!expiryDate) {
            return {
                valid: false,
                message:
                    "Expiry date is required."
            };
        }


        const expiry =
            new Date(expiryDate);

        if (Number.isNaN(
            expiry.getTime()
        )) {
            return {
                valid: false,
                message:
                    "Please enter a valid expiry date."
            };
        }


        if (
            quantity === null ||
            quantity < 0
        ) {
            return {
                valid: false,
                message:
                    "Quantity must be zero or greater."
            };
        }


        if (
            reorderLevel === null ||
            reorderLevel < 0
        ) {
            return {
                valid: false,
                message:
                    "Reorder level must be zero or greater."
            };
        }


        if (
            purchasePrice !== null &&
            purchasePrice < 0
        ) {
            return {
                valid: false,
                message:
                    "Purchase price cannot be negative."
            };
        }


        if (
            sellingPrice !== null &&
            sellingPrice < 0
        ) {
            return {
                valid: false,
                message:
                    "Selling price cannot be negative."
            };
        }


        if (
            purchasePrice !== null &&
            sellingPrice !== null &&
            sellingPrice < purchasePrice
        ) {
            return {
                valid: false,
                message:
                    "Selling price should not be lower than purchase price."
            };
        }


        return {
            valid: true,
            message: ""
        };
    }


    /* =====================================================
       PAYLOAD
       ===================================================== */

    function buildPayload() {

        return {
            medicineName:
                getValue(
                    "inventoryMedicineName"
                ),

            genericName:
                getValue(
                    "inventoryGenericName"
                ),

            brandName:
                getValue(
                    "inventoryBrandName"
                ),

            category:
                getValue(
                    "inventoryCategory"
                ),

            dosageForm:
                getValue(
                    "inventoryDosageForm"
                ),

            strength:
                getValue(
                    "inventoryStrength"
                ),

            batchNumber:
                getValue(
                    "inventoryBatchNumber"
                ),

            expiryDate:
                getValue(
                    "inventoryExpiryDate"
                ),

            quantity:
                getNumberValue(
                    "inventoryQuantity"
                ) ?? 0,

            reorderLevel:
                getNumberValue(
                    "inventoryReorderLevel"
                ) ?? 0,

            unit:
                getValue(
                    "inventoryUnit"
                ) || "units",

            status:
                getValue(
                    "inventoryStatus"
                ) || "active",

            purchasePrice:
                getNumberValue(
                    "inventoryPurchasePrice"
                ) ?? 0,

            sellingPrice:
                getNumberValue(
                    "inventorySellingPrice"
                ) ?? 0,

            supplier:
                getValue(
                    "inventorySupplier"
                ),

            supplierContact:
                getValue(
                    "inventorySupplierContact"
                ),

            location:
                getValue(
                    "inventoryLocation"
                ),

            notes:
                getValue(
                    "inventoryNotes"
                )
        };
    }


    /* =====================================================
       POPULATE FORM
       ===================================================== */

    function populateForm(item) {

        if (!item) {
            return;
        }

        setValue(
            "inventoryMedicineName",
            item.medicineName ||
            item.name
        );

        setValue(
            "inventoryGenericName",
            item.genericName
        );

        setValue(
            "inventoryBrandName",
            item.brandName
        );

        setValue(
            "inventoryCategory",
            item.category
        );

        setValue(
            "inventoryDosageForm",
            item.dosageForm
        );

        setValue(
            "inventoryStrength",
            item.strength
        );

        setValue(
            "inventoryBatchNumber",
            item.batchNumber ||
            item.batch
        );

        if (item.expiryDate) {

            const date =
                new Date(
                    item.expiryDate
                );

            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {
                setValue(
                    "inventoryExpiryDate",
                    date.toISOString()
                        .split("T")[0]
                );
            }
        }

        setValue(
            "inventoryQuantity",
            item.quantity ??
            item.stockQuantity ??
            0
        );

        setValue(
            "inventoryReorderLevel",
            item.reorderLevel ??
            item.minimumStock ??
            0
        );

        setValue(
            "inventoryUnit",
            item.unit ||
            "units"
        );

        setValue(
            "inventoryStatus",
            item.status ||
            "active"
        );

        setValue(
            "inventoryPurchasePrice",
            item.purchasePrice ??
            0
        );

        setValue(
            "inventorySellingPrice",
            item.sellingPrice ??
            0
        );

        setValue(
            "inventorySupplier",
            item.supplier
        );

        setValue(
            "inventorySupplierContact",
            item.supplierContact
        );

        setValue(
            "inventoryLocation",
            item.location
        );

        setValue(
            "inventoryNotes",
            item.notes
        );
    }


    /* =====================================================
       OPEN CREATE
       ===================================================== */

    function openCreate() {

        resetForm();

        const modal =
            getModal();

        if (modal) {
            modal.show();
        }
    }


    /* =====================================================
       OPEN EDIT
       ===================================================== */

    function openEdit(item) {

        if (!item) {
            return;
        }

        resetForm();

        state.editingId =
            item._id ||
            item.id ||
            null;

        const modalLabel =
            getElement(
                "inventoryModalLabel"
            );

        if (modalLabel) {
            modalLabel.textContent =
                "Edit Medicine";
        }

        populateForm(item);

        const modal =
            getModal();

        if (modal) {
            modal.show();
        }
    }


    /* =====================================================
       SAVE BUTTON
       ===================================================== */

    function setSaveButtonState(
        loading
    ) {

        const button =
            getElement(
                "saveInventoryBtn"
            );

        const spinner =
            getElement(
                "saveInventorySpinner"
            );

        const icon =
            getElement(
                "saveInventoryIcon"
            );

        const text =
            getElement(
                "saveInventoryText"
            );

        if (!button) {
            return;
        }

        button.disabled =
            loading;

        if (spinner) {
            spinner.classList.toggle(
                "d-none",
                !loading
            );
        }

        if (icon) {
            icon.classList.toggle(
                "d-none",
                loading
            );
        }

        if (text) {
            text.textContent =
                loading
                    ? "Saving..."
                    : state.editingId
                        ? "Update Medicine"
                        : "Save Medicine";
        }
    }


    /* =====================================================
       SAVE
       ===================================================== */

    async function saveInventory() {

        clearFormAlert();

        const validation =
            validateForm();

        if (!validation.valid) {

            showFormAlert(
                validation.message
            );

            return;
        }

        const payload =
            buildPayload();

        setSaveButtonState(true);

        try {

            let response;

            if (state.editingId) {

                response =
                    await data.updateInventory(
                        state.editingId,
                        payload
                    );

            } else {

                response =
                    await data.createInventory(
                        payload
                    );
            }

            showFormAlert(
                state.editingId
                    ? "Medicine updated successfully."
                    : "Medicine added successfully.",
                "success"
            );

            ui.showToast(
                state.editingId
                    ? "Medicine updated successfully."
                    : "Medicine added successfully.",
                "success"
            );

            document.dispatchEvent(
                new CustomEvent(
                    "medicore:pharmacy:saved",
                    {
                        detail: {
                            response,
                            item: payload,
                            id: state.editingId
                        }
                    }
                )
            );

            setTimeout(() => {

                const modal =
                    getModal();

                if (modal) {
                    modal.hide();
                }

            }, 500);

        } catch (error) {

            console.error(
                "Unable to save pharmacy inventory:",
                error
            );

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unable to save medicine. Please try again.";

            showFormAlert(
                message
            );

            ui.showToast(
                message,
                "danger"
            );

        } finally {

            setSaveButtonState(false);
        }
    }


    /* =====================================================
       EVENT LISTENERS
       ===================================================== */

    function bindEvents() {

        const form =
            getElement(
                "inventoryForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    saveInventory();
                }
            );
        }


        const addButton =
            getElement(
                "addInventoryBtn"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                openCreate
            );
        }


        const emptyAddButton =
            getElement(
                "emptyAddMedicineBtn"
            );

        if (emptyAddButton) {

            emptyAddButton.addEventListener(
                "click",
                openCreate
            );
        }


        document.addEventListener(
            "medicore:pharmacy:edit",
            event => {

                const item =
                    event.detail?.item;

                if (item) {
                    openEdit(item);
                }
            }
        );


        document.addEventListener(
            "medicore:pharmacy:create",
            openCreate
        );


        const modal =
            getElement(
                "inventoryModal"
            );

        if (modal) {

            modal.addEventListener(
                "hidden.bs.modal",
                resetForm
            );
        }
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function init() {
        bindEvents();
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.mediCorePharmacyForm = {

        state,

        resetForm,

        openCreate,

        openEdit,

        populateForm,

        validateForm,

        buildPayload,

        saveInventory

    };

})();