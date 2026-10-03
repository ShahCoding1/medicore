/* =========================================================
   MEDICORE — PHARMACY INVENTORY CONTROLLER
   Phase 12 — Pharmacy Inventory
   ========================================================= */

(function () {
    "use strict";

    const data = window.mediCorePharmacyData;
    const ui = window.mediCorePharmacyUI;

    if (!data || !ui) {
        console.error(
            "MediCore Pharmacy modules are not available."
        );
        return;
    }

    const state = {
        search: "",
        category: "",
        status: "",
        quickFilter: "all",
        loading: false
    };


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       RESPONSE NORMALIZATION
       ===================================================== */

    function extractInventory(response) {

        if (Array.isArray(response)) {
            return response;
        }

        if (!response) {
            return [];
        }

        if (Array.isArray(response.inventory)) {
            return response.inventory;
        }

        if (Array.isArray(response.items)) {
            return response.items;
        }

        if (Array.isArray(response.medicines)) {
            return response.medicines;
        }

        if (Array.isArray(response.records)) {
            return response.records;
        }

        if (
            response.data &&
            Array.isArray(response.data)
        ) {
            return response.data;
        }

        if (
            response.data &&
            Array.isArray(
                response.data.inventory
            )
        ) {
            return response.data.inventory;
        }

        if (
            response.data &&
            Array.isArray(
                response.data.items
            )
        ) {
            return response.data.items;
        }

        return [];
    }


    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(loading) {

        state.loading = loading;

        if (loading) {
            ui.showLoading();
        }
    }


    /* =====================================================
       LOAD INVENTORY
       ===================================================== */

    async function loadInventory() {

        setLoading(true);

        try {

            const response =
                await data.getInventory();

            const inventory =
                extractInventory(response);

            ui.setInventory(
                inventory
            );

            applyFilters();

        } catch (error) {

            console.error(
                "Unable to load pharmacy inventory:",
                error
            );

            ui.setInventory([]);

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to load pharmacy inventory."
                ),
                "danger"
            );

        } finally {

            state.loading = false;
        }
    }


    /* =====================================================
       ERROR MESSAGE
       ===================================================== */

    function getErrorMessage(
        error,
        fallback
    ) {

        return (
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            fallback
        );
    }


    /* =====================================================
       FILTERING
       ===================================================== */

    function applyFilters() {

        let items =
            ui.getInventory();

        const search =
            state.search
                .trim()
                .toLowerCase();

        const category =
            state.category
                .trim()
                .toLowerCase();

        const status =
            state.status
                .trim()
                .toLowerCase();


        /* Search */

        if (search) {

            items =
                items.filter(item => {

                    const values = [

                        item?.medicineName,

                        item?.name,

                        item?.genericName,

                        item?.brandName,

                        item?.batchNumber,

                        item?.batch,

                        item?.supplier,

                        item?.category

                    ];

                    return values.some(
                        value =>
                            String(
                                value ?? ""
                            )
                                .toLowerCase()
                                .includes(search)
                    );
                });
        }


        /* Category */

        if (category) {

            items =
                items.filter(item =>
                    String(
                        item?.category ?? ""
                    )
                        .toLowerCase() ===
                    category
                );
        }


        /* Status */

        if (status) {

            items =
                items.filter(item =>
                    ui.normalizeStatus(
                        item?.status
                    ) === status
                );
        }


        /* Quick filters */

        if (
            state.quickFilter ===
            "low-stock"
        ) {

            items =
                items.filter(
                    ui.isLowStock
                );
        }


        if (
            state.quickFilter ===
            "expiring"
        ) {

            items =
                items.filter(
                    ui.isExpiringSoon
                );
        }


        ui.setFilteredInventory(
            items
        );
    }


    /* =====================================================
       CATEGORY FILTER
       ===================================================== */

    function populateCategories() {

        const select =
            getElement(
                "pharmacyCategoryFilter"
            );

        if (!select) {
            return;
        }

        const currentValue =
            select.value;

        const categories =
            new Set();

        ui.getInventory()
            .forEach(item => {

                const category =
                    item?.category;

                if (
                    category &&
                    String(category).trim()
                ) {
                    categories.add(
                        String(category).trim()
                    );
                }
            });

        const sorted =
            Array.from(categories)
                .sort(
                    (a, b) =>
                        a.localeCompare(b)
                );

        select.innerHTML = `
            <option value="">
                All categories
            </option>
        `;

        sorted.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                select.appendChild(
                    option
                );
            }
        );

        if (
            sorted.includes(
                currentValue
            )
        ) {
            select.value =
                currentValue;
        }
    }


    /* =====================================================
       FILTER INPUTS
       ===================================================== */

    function handleSearch(event) {

        state.search =
            event.target.value;

        applyFilters();
    }


    function handleCategory(event) {

        state.category =
            event.target.value;

        applyFilters();
    }


    function handleStatus(event) {

        state.status =
            event.target.value;

        applyFilters();
    }


    function clearFilters() {

        state.search = "";
        state.category = "";
        state.status = "";
        state.quickFilter = "all";


        const search =
            getElement(
                "pharmacySearch"
            );

        const category =
            getElement(
                "pharmacyCategoryFilter"
            );

        const status =
            getElement(
                "pharmacyStatusFilter"
            );

        if (search) {
            search.value = "";
        }

        if (category) {
            category.value = "";
        }

        if (status) {
            status.value = "";
        }


        updateQuickFilterButtons();

        applyFilters();
    }


    /* =====================================================
       QUICK FILTERS
       ===================================================== */

    function setQuickFilter(
        filter
    ) {

        if (
            filter !== "all" &&
            filter !== "low-stock" &&
            filter !== "expiring"
        ) {
            filter = "all";
        }

        state.quickFilter =
            filter;

        updateQuickFilterButtons();

        applyFilters();
    }


    function updateQuickFilterButtons() {

        const lowStockButton =
            getElement(
                "lowStockFilterBtn"
            );

        const expiringButton =
            getElement(
                "expiringFilterBtn"
            );


        if (lowStockButton) {

            lowStockButton.classList.toggle(
                "active",
                state.quickFilter ===
                    "low-stock"
            );
        }


        if (expiringButton) {

            expiringButton.classList.toggle(
                "active",
                state.quickFilter ===
                    "expiring"
            );
        }
    }


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    function handleTableClick(
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

        const id =
            button.dataset.id;

        if (!id) {
            return;
        }

        const item =
            ui.findById(id);

        if (!item) {
            ui.showToast(
                "The selected medicine could not be found.",
                "warning"
            );

            return;
        }


        if (action === "view") {

            ui.openViewModal(item);

            return;
        }


        if (action === "edit") {

            document.dispatchEvent(
                new CustomEvent(
                    "medicore:pharmacy:edit",
                    {
                        detail: {
                            item
                        }
                    }
                )
            );

            return;
        }


        if (action === "delete") {

            deleteInventory(item);
        }
    }


    /* =====================================================
       DELETE
       ===================================================== */

    async function deleteInventory(
        item
    ) {

        const id =
            item?._id ||
            item?.id;

        if (!id) {
            ui.showToast(
                "Inventory ID is missing.",
                "danger"
            );

            return;
        }

        const name =
            ui.getMedicineName(item);

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${name}" from pharmacy inventory?`
            );

        if (!confirmed) {
            return;
        }


        try {

            await data.deleteInventory(
                id
            );

            ui.showToast(
                "Medicine deleted successfully.",
                "success"
            );

            await loadInventory();

        } catch (error) {

            console.error(
                "Unable to delete inventory item:",
                error
            );

            ui.showToast(
                getErrorMessage(
                    error,
                    "Unable to delete medicine."
                ),
                "danger"
            );
        }
    }


    /* =====================================================
       REFRESH
       ===================================================== */

    async function refresh() {

        const button =
            getElement(
                "refreshPharmacyBtn"
            );

        if (button) {
            button.disabled = true;

            button.classList.add(
                "is-loading"
            );
        }

        try {

            await loadInventory();

            populateCategories();

        } finally {

            if (button) {

                button.disabled = false;

                button.classList.remove(
                    "is-loading"
                );
            }
        }
    }


    /* =====================================================
       FORM SAVE EVENT
       ===================================================== */

    async function handleSaved() {

        await loadInventory();

        populateCategories();
    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function bindEmptyState() {

        const button =
            getElement(
                "emptyAddMedicineBtn"
            );

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                document.dispatchEvent(
                    new CustomEvent(
                        "medicore:pharmacy:create"
                    )
                );
            }
        );
    }


    /* =====================================================
       KEYBOARD SHORTCUT
       ===================================================== */

    function bindKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "k"
                ) {
                    return;
                }

                if (
                    event.key === "/" &&
                    !isTypingTarget(
                        event.target
                    )
                ) {

                    event.preventDefault();

                    const search =
                        getElement(
                            "pharmacySearch"
                        );

                    if (search) {
                        search.focus();
                    }
                }
            }
        );
    }


    function isTypingTarget(
        target
    ) {

        if (!target) {
            return false;
        }

        const tag =
            target.tagName?.toLowerCase();

        return (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            target.isContentEditable
        );
    }


    /* =====================================================
       EVENT BINDING
       ===================================================== */

    function bindEvents() {

        const search =
            getElement(
                "pharmacySearch"
            );

        if (search) {

            search.addEventListener(
                "input",
                handleSearch
            );
        }


        const category =
            getElement(
                "pharmacyCategoryFilter"
            );

        if (category) {

            category.addEventListener(
                "change",
                handleCategory
            );
        }


        const status =
            getElement(
                "pharmacyStatusFilter"
            );

        if (status) {

            status.addEventListener(
                "change",
                handleStatus
            );
        }


        const clear =
            getElement(
                "clearPharmacyFilters"
            );

        if (clear) {

            clear.addEventListener(
                "click",
                clearFilters
            );
        }


        const lowStock =
            getElement(
                "lowStockFilterBtn"
            );

        if (lowStock) {

            lowStock.addEventListener(
                "click",
                () => {

                    setQuickFilter(
                        state.quickFilter ===
                            "low-stock"
                            ? "all"
                            : "low-stock"
                    );
                }
            );
        }


        const expiring =
            getElement(
                "expiringFilterBtn"
            );

        if (expiring) {

            expiring.addEventListener(
                "click",
                () => {

                    setQuickFilter(
                        state.quickFilter ===
                            "expiring"
                            ? "all"
                            : "expiring"
                    );
                }
            );
        }


        const refreshButton =
            getElement(
                "refreshPharmacyBtn"
            );

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refresh
            );
        }


        const tableBody =
            getElement(
                "pharmacyTableBody"
            );

        if (tableBody) {

            tableBody.addEventListener(
                "click",
                handleTableClick
            );
        }


        document.addEventListener(
            "medicore:pharmacy:saved",
            handleSaved
        );


        bindEmptyState();

        bindKeyboardShortcuts();
    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    async function init() {

        bindEvents();

        updateQuickFilterButtons();

        await loadInventory();

        populateCategories();
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

    window.mediCorePharmacy = {

        state,

        loadInventory,

        refresh,

        applyFilters,

        clearFilters,

        setQuickFilter,

        populateCategories,

        deleteInventory

    };

})();