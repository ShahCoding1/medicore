/* =========================================================
   MEDICORE — PHARMACY INVENTORY UI
   Phase 12 — Pharmacy Inventory
   ========================================================= */

(function () {
    "use strict";

    const uiState = {
        inventory: [],
        filteredInventory: [],
        selectedItem: null,
        currentFilter: "all"
    };


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       FORMATTING
       ===================================================== */

    function formatCurrency(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "—";
        }

        return number.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }


    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function normalizeStatus(status) {
        const value = String(
            status || "active"
        )
            .trim()
            .toLowerCase();

        return value;
    }


    function getStatusLabel(status) {
        const normalized =
            normalizeStatus(status);

        const labels = {
            active: "Active",
            inactive: "Inactive",
            discontinued: "Discontinued",
            out_of_stock: "Out of Stock",
            "out-of-stock": "Out of Stock"
        };

        return (
            labels[normalized] ||
            normalized
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, char =>
                    char.toUpperCase()
                )
        );
    }


    function getStatusClass(status) {
        const normalized =
            normalizeStatus(status);

        if (normalized === "active") {
            return "status-active";
        }

        if (
            normalized === "inactive" ||
            normalized === "discontinued"
        ) {
            return "status-inactive";
        }

        if (
            normalized === "out_of_stock" ||
            normalized === "out-of-stock"
        ) {
            return "status-out";
        }

        return "status-neutral";
    }


    /* =====================================================
       INVENTORY HELPERS
       ===================================================== */

    function getQuantity(item) {
        return Number(
            item?.quantity ??
            item?.stockQuantity ??
            item?.currentStock ??
            0
        );
    }


    function getReorderLevel(item) {
        return Number(
            item?.reorderLevel ??
            item?.minimumStock ??
            item?.minStock ??
            0
        );
    }


    function isLowStock(item) {
        const quantity =
            getQuantity(item);

        const reorderLevel =
            getReorderLevel(item);

        return (
            reorderLevel > 0 &&
            quantity <= reorderLevel
        );
    }


    function isExpiringSoon(item) {
        if (!item?.expiryDate) {
            return false;
        }

        const expiry =
            new Date(item.expiryDate);

        if (Number.isNaN(expiry.getTime())) {
            return false;
        }

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const limit = new Date(today);

        limit.setDate(
            limit.getDate() + 90
        );

        return (
            expiry >= today &&
            expiry <= limit
        );
    }


    function isExpired(item) {
        if (!item?.expiryDate) {
            return false;
        }

        const expiry =
            new Date(item.expiryDate);

        if (Number.isNaN(expiry.getTime())) {
            return false;
        }

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        return expiry < today;
    }


    function getMedicineName(item) {
        return (
            item?.medicineName ||
            item?.name ||
            item?.medicine ||
            "Unnamed Medicine"
        );
    }


    function getGenericName(item) {
        return (
            item?.genericName ||
            "—"
        );
    }


    function getCategory(item) {
        return (
            item?.category ||
            "Other"
        );
    }


    function getBatchNumber(item) {
        return (
            item?.batchNumber ||
            item?.batch ||
            "—"
        );
    }


    function getUnit(item) {
        return (
            item?.unit ||
            "Units"
        );
    }


    function getItemId(item) {
        return (
            item?._id ||
            item?.id ||
            ""
        );
    }


    /* =====================================================
       TABLE STATE
       ===================================================== */

    function showLoading() {
        const loading =
            getElement("pharmacyLoading");

        const wrapper =
            getElement(
                "pharmacyTableWrapper"
            );

        const empty =
            getElement("pharmacyEmpty");

        if (loading) {
            loading.classList.remove("d-none");
        }

        if (wrapper) {
            wrapper.classList.add("d-none");
        }

        if (empty) {
            empty.classList.add("d-none");
        }
    }


    function showTable() {
        const loading =
            getElement("pharmacyLoading");

        const wrapper =
            getElement(
                "pharmacyTableWrapper"
            );

        const empty =
            getElement("pharmacyEmpty");

        if (loading) {
            loading.classList.add("d-none");
        }

        if (wrapper) {
            wrapper.classList.remove("d-none");
        }

        if (empty) {
            empty.classList.add("d-none");
        }
    }


    function showEmpty() {
        const loading =
            getElement("pharmacyLoading");

        const wrapper =
            getElement(
                "pharmacyTableWrapper"
            );

        const empty =
            getElement("pharmacyEmpty");

        if (loading) {
            loading.classList.add("d-none");
        }

        if (wrapper) {
            wrapper.classList.add("d-none");
        }

        if (empty) {
            empty.classList.remove("d-none");
        }
    }


    /* =====================================================
       TABLE ROW
       ===================================================== */

    function renderRow(item) {
        const id =
            getItemId(item);

        const medicineName =
            getMedicineName(item);

        const genericName =
            getGenericName(item);

        const category =
            getCategory(item);

        const batch =
            getBatchNumber(item);

        const expiry =
            item?.expiryDate
                ? formatDate(
                    item.expiryDate
                )
                : "—";

        const quantity =
            getQuantity(item);

        const reorder =
            getReorderLevel(item);

        const unit =
            getUnit(item);

        const status =
            item?.status ||
            "active";

        const lowStock =
            isLowStock(item);

        const expired =
            isExpired(item);

        const expiring =
            isExpiringSoon(item);

        let stockClass =
            "stock-normal";

        if (quantity <= 0) {
            stockClass =
                "stock-empty";
        } else if (lowStock) {
            stockClass =
                "stock-low";
        }

        let expiryClass =
            "";

        if (expired) {
            expiryClass =
                "expiry-danger";
        } else if (expiring) {
            expiryClass =
                "expiry-warning";
        }

        return `
            <tr data-id="${escapeHtml(id)}">

                <td>
                    <div class="medicine-cell">
                        <div class="medicine-avatar">
                            <i class="bi bi-capsule"></i>
                        </div>

                        <div class="medicine-info">
                            <div class="medicine-name">
                                ${escapeHtml(
                                    medicineName
                                )}
                            </div>

                            <div class="medicine-generic">
                                ${escapeHtml(
                                    genericName
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="category-text">
                        ${escapeHtml(
                            category
                        )}
                    </span>
                </td>

                <td>
                    <span class="batch-text">
                        ${escapeHtml(batch)}
                    </span>
                </td>

                <td>
                    <span class="${expiryClass}">
                        ${escapeHtml(expiry)}
                    </span>
                </td>

                <td>
                    <div class="stock-cell">
                        <span class="${stockClass}">
                            ${escapeHtml(
                                quantity
                            )}
                        </span>

                        <span class="stock-unit">
                            ${escapeHtml(unit)}
                        </span>
                    </div>

                    ${
                        lowStock
                            ? `
                                <span class="stock-warning">
                                    <i class="bi bi-exclamation-circle"></i>
                                    Low stock
                                </span>
                            `
                            : ""
                    }
                </td>

                <td>
                    <span class="status-badge ${getStatusClass(status)}">
                        <span class="status-dot"></span>
                        ${escapeHtml(
                            getStatusLabel(status)
                        )}
                    </span>
                </td>

                <td class="text-end">
                    <div class="table-actions">

                        <button
                            type="button"
                            class="btn btn-sm table-action-btn"
                            data-action="view"
                            data-id="${escapeHtml(id)}"
                            title="View medicine"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm table-action-btn"
                            data-action="edit"
                            data-id="${escapeHtml(id)}"
                            title="Edit medicine"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm table-action-btn table-action-danger"
                            data-action="delete"
                            data-id="${escapeHtml(id)}"
                            title="Delete medicine"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }


    /* =====================================================
       TABLE RENDER
       ===================================================== */

    function renderTable(items = []) {

        const tbody =
            getElement(
                "pharmacyTableBody"
            );

        if (!tbody) {
            return;
        }

        if (!items.length) {
            tbody.innerHTML = "";
            showEmpty();
            updateCount(0);
            return;
        }

        tbody.innerHTML =
            items
                .map(renderRow)
                .join("");

        showTable();

        updateCount(
            items.length
        );
    }


    /* =====================================================
       COUNT
       ===================================================== */

    function updateCount(count) {

        const countElement =
            getElement(
                "pharmacyInventoryCount"
            );

        if (countElement) {
            countElement.textContent =
                `${count} ${
                    count === 1
                        ? "medicine"
                        : "medicines"
                }`;
        }
    }


    /* =====================================================
       SUMMARY CARDS
       ===================================================== */

    function updateSummary(items = []) {

        const total =
            items.length;

        const active =
            items.filter(item =>
                normalizeStatus(
                    item.status
                ) === "active"
            ).length;

        const lowStock =
            items.filter(
                isLowStock
            ).length;

        const expiring =
            items.filter(
                isExpiringSoon
            ).length;

        const totalElement =
            getElement(
                "pharmacyTotalMedicines"
            );

        const activeElement =
            getElement(
                "pharmacyActiveMedicines"
            );

        const lowStockElement =
            getElement(
                "pharmacyLowStock"
            );

        const expiringElement =
            getElement(
                "pharmacyExpiringSoon"
            );

        if (totalElement) {
            totalElement.textContent =
                total.toLocaleString();
        }

        if (activeElement) {
            activeElement.textContent =
                active.toLocaleString();
        }

        if (lowStockElement) {
            lowStockElement.textContent =
                lowStock.toLocaleString();
        }

        if (expiringElement) {
            expiringElement.textContent =
                expiring.toLocaleString();
        }
    }


    /* =====================================================
       VIEW MODAL
       ===================================================== */

    function renderViewModal(item) {

        const container =
            getElement(
                "inventoryDetails"
            );

        if (!container || !item) {
            return;
        }

        const medicineName =
            getMedicineName(item);

        const genericName =
            getGenericName(item);

        const category =
            getCategory(item);

        const batch =
            getBatchNumber(item);

        const quantity =
            getQuantity(item);

        const reorder =
            getReorderLevel(item);

        const unit =
            getUnit(item);

        const status =
            getStatusLabel(
                item.status
            );

        const supplier =
            item?.supplier ||
            "—";

        const supplierContact =
            item?.supplierContact ||
            "—";

        const location =
            item?.location ||
            "—";

        const dosageForm =
            item?.dosageForm ||
            "—";

        const strength =
            item?.strength ||
            "—";

        const expiry =
            formatDate(
                item?.expiryDate
            );

        const purchasePrice =
            formatCurrency(
                item?.purchasePrice
            );

        const sellingPrice =
            formatCurrency(
                item?.sellingPrice
            );

        const notes =
            item?.notes ||
            "No notes added.";

        container.innerHTML = `
            <div class="inventory-view-header">

                <div class="inventory-view-icon">
                    <i class="bi bi-capsule"></i>
                </div>

                <div>
                    <h5 class="inventory-view-title">
                        ${escapeHtml(
                            medicineName
                        )}
                    </h5>

                    <p class="inventory-view-subtitle">
                        ${escapeHtml(
                            genericName
                        )}
                    </p>
                </div>

            </div>

            <div class="inventory-detail-grid">

                ${detailItem(
                    "Category",
                    category,
                    "bi-grid"
                )}

                ${detailItem(
                    "Dosage Form",
                    dosageForm,
                    "bi-capsule"
                )}

                ${detailItem(
                    "Strength",
                    strength,
                    "bi-prescription2"
                )}

                ${detailItem(
                    "Batch Number",
                    batch,
                    "bi-upc-scan"
                )}

                ${detailItem(
                    "Expiry Date",
                    expiry,
                    "bi-calendar-event"
                )}

                ${detailItem(
                    "Quantity",
                    `${quantity} ${unit}`,
                    "bi-box-seam"
                )}

                ${detailItem(
                    "Reorder Level",
                    `${reorder} ${unit}`,
                    "bi-arrow-repeat"
                )}

                ${detailItem(
                    "Status",
                    status,
                    "bi-check-circle"
                )}

                ${detailItem(
                    "Purchase Price",
                    purchasePrice,
                    "bi-currency-dollar"
                )}

                ${detailItem(
                    "Selling Price",
                    sellingPrice,
                    "bi-tag"
                )}

                ${detailItem(
                    "Supplier",
                    supplier,
                    "bi-building"
                )}

                ${detailItem(
                    "Supplier Contact",
                    supplierContact,
                    "bi-telephone"
                )}

                ${detailItem(
                    "Storage Location",
                    location,
                    "bi-geo-alt"
                )}

            </div>

            <div class="inventory-view-notes">
                <div class="inventory-detail-label">
                    <i class="bi bi-card-text"></i>
                    Notes
                </div>

                <div class="inventory-detail-notes">
                    ${escapeHtml(notes)}
                </div>
            </div>
        `;
    }


    function detailItem(
        label,
        value,
        icon
    ) {
        return `
            <div class="inventory-detail-item">

                <div class="inventory-detail-label">
                    <i class="bi ${escapeHtml(icon)}"></i>
                    ${escapeHtml(label)}
                </div>

                <div class="inventory-detail-value">
                    ${escapeHtml(value)}
                </div>

            </div>
        `;
    }


    function openViewModal(item) {

        if (!item) {
            return;
        }

        uiState.selectedItem =
            item;

        renderViewModal(item);

        const modalElement =
            getElement(
                "viewInventoryModal"
            );

        if (
            modalElement &&
            window.bootstrap
        ) {
            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();
        }
    }


    /* =====================================================
       TOASTS
       ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        const container =
            getElement(
                "pharmacyToastContainer"
            );

        if (!container) {
            return;
        }

        const safeMessage =
            escapeHtml(message);

        const toastId =
            `pharmacyToast-${Date.now()}`;

        const iconMap = {
            success:
                "bi-check-circle-fill",
            danger:
                "bi-x-circle-fill",
            warning:
                "bi-exclamation-triangle-fill",
            info:
                "bi-info-circle-fill"
        };

        const icon =
            iconMap[type] ||
            iconMap.info;

        const toast = document.createElement(
            "div"
        );

        toast.className =
            `toast pharmacy-toast pharmacy-toast-${type}`;

        toast.id = toastId;

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
            <div class="toast-body">

                <div class="toast-icon">
                    <i class="bi ${icon}"></i>
                </div>

                <div class="toast-message">
                    ${safeMessage}
                </div>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                ></button>

            </div>
        `;

        container.appendChild(toast);

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


    /* =====================================================
       PUBLIC STATE
       ===================================================== */

    function setInventory(items) {

        uiState.inventory =
            Array.isArray(items)
                ? items
                : [];

        uiState.filteredInventory =
            [...uiState.inventory];

        updateSummary(
            uiState.inventory
        );

        renderTable(
            uiState.filteredInventory
        );
    }


    function getInventory() {
        return [
            ...uiState.inventory
        ];
    }


    function getFilteredInventory() {
        return [
            ...uiState.filteredInventory
        ];
    }


    function findById(id) {

        return uiState.inventory.find(
            item =>
                String(
                    getItemId(item)
                ) === String(id)
        );
    }


    function setFilteredInventory(
        items
    ) {

        uiState.filteredInventory =
            Array.isArray(items)
                ? items
                : [];

        renderTable(
            uiState.filteredInventory
        );
    }


    /* =====================================================
       EXPORT
       ===================================================== */

    window.mediCorePharmacyUI = {

        state: uiState,

        showLoading,

        showTable,

        showEmpty,

        renderRow,

        renderTable,

        updateCount,

        updateSummary,

        renderViewModal,

        openViewModal,

        showToast,

        setInventory,

        getInventory,

        getFilteredInventory,

        findById,

        setFilteredInventory,

        isLowStock,

        isExpiringSoon,

        isExpired,

        getMedicineName,

        getGenericName,

        getCategory,

        getBatchNumber,

        getQuantity,

        getReorderLevel,

        formatCurrency,

        formatDate,

        normalizeStatus,

        getStatusLabel,

        getStatusClass

    };

})();