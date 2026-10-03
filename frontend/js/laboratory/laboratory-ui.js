/* =========================================================
   MEDICORE — LABORATORY UI LAYER
   Phase 13 — Laboratory Tests
   ========================================================= */

(function () {
    "use strict";

    const laboratoryData = window.mediCoreLaboratoryData;

    if (!laboratoryData) {
        console.error(
            "MediCore Laboratory Data layer is not available."
        );
        return;
    }

    const state = {
        tests: [],
        filteredTests: [],
        selectedTest: null,
        currentFilter: {
            search: "",
            category: "",
            status: ""
        }
    };

    const elements = {
        totalTests: document.getElementById("labTotalTests"),
        activeTests: document.getElementById("labActiveTests"),
        categoryCount: document.getElementById(
            "labCategoryCount"
        ),
        averagePrice: document.getElementById(
            "labAveragePrice"
        ),

        testCount: document.getElementById(
            "labTestCount"
        ),

        tableWrapper: document.getElementById(
            "labTestsTableWrapper"
        ),
        tableBody: document.getElementById(
            "labTestsTableBody"
        ),
        loading: document.getElementById(
            "labTestsLoading"
        ),
        empty: document.getElementById(
            "labTestsEmpty"
        ),

        details: document.getElementById(
            "labTestDetails"
        ),

        toastContainer: document.getElementById(
            "laboratoryToastContainer"
        )
    };

    function escapeHtml(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalizeTest(test = {}) {
        return {
            id:
                test._id ||
                test.id ||
                "",

            testName:
                test.testName ||
                test.name ||
                "Unnamed Test",

            testCode:
                test.testCode ||
                test.code ||
                "—",

            category:
                test.category ||
                "Uncategorized",

            description:
                test.description ||
                "",

            sampleType:
                test.sampleType ||
                "—",

            preparationRequired:
                Boolean(
                    test.preparationRequired
                ),

            preparationInstructions:
                test.preparationInstructions ||
                "",

            turnaroundTime:
                test.turnaroundTime ||
                "—",

            price:
                Number(test.price) || 0,

            status:
                String(
                    test.status || "active"
                ).toLowerCase(),

            createdAt:
                test.createdAt || null,

            updatedAt:
                test.updatedAt || null,

            createdBy:
                test.createdBy || null
        };
    }

    function normalizeTests(tests) {
        if (!Array.isArray(tests)) {
            return [];
        }

        return tests.map(normalizeTest);
    }

    function formatCurrency(value) {
        const amount = Number(value);

        if (!Number.isFinite(amount)) {
            return "0.00";
        }

        return amount.toLocaleString(
            "en-PK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
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

    function truncateText(
        value,
        maxLength = 80
    ) {
        const text = String(value || "");

        if (text.length <= maxLength) {
            return text;
        }

        return (
            text.substring(0, maxLength - 3) +
            "..."
        );
    }

    function getStatusBadge(status) {
        const normalized =
            String(status || "active")
                .toLowerCase();

        if (normalized === "inactive") {
            return `
                <span class="laboratory-status-badge inactive">
                    <span class="status-dot"></span>
                    Inactive
                </span>
            `;
        }

        return `
            <span class="laboratory-status-badge active">
                <span class="status-dot"></span>
                Active
            </span>
        `;
    }

    function getPreparationBadge(test) {
        if (test.preparationRequired) {
            return `
                <span class="laboratory-preparation-badge required">
                    Required
                </span>
            `;
        }

        return `
            <span class="laboratory-preparation-badge not-required">
                Not required
            </span>
        `;
    }

    function updateSummary() {
        const tests = state.tests;

        const total = tests.length;

        const active = tests.filter(
            (test) =>
                test.status === "active"
        ).length;

        const categories = new Set(
            tests
                .map((test) =>
                    String(
                        test.category || ""
                    ).trim()
                )
                .filter(Boolean)
        );

        const totalPrice = tests.reduce(
            (sum, test) =>
                sum + Number(test.price || 0),
            0
        );

        const average =
            total > 0
                ? totalPrice / total
                : 0;

        if (elements.totalTests) {
            elements.totalTests.textContent =
                total.toLocaleString();
        }

        if (elements.activeTests) {
            elements.activeTests.textContent =
                active.toLocaleString();
        }

        if (elements.categoryCount) {
            elements.categoryCount.textContent =
                categories.size.toLocaleString();
        }

        if (elements.averagePrice) {
            elements.averagePrice.textContent =
                formatCurrency(average);
        }
    }

    function updateCount() {
        if (!elements.testCount) {
            return;
        }

        const count =
            state.filteredTests.length;

        elements.testCount.textContent =
            `${count} ${
                count === 1
                    ? "test"
                    : "tests"
            }`;
    }

    function renderTable() {
        if (!elements.tableBody) {
            return;
        }

        elements.tableBody.innerHTML = "";

        const tests =
            state.filteredTests;

        if (!tests.length) {
            showEmptyState();
            updateCount();
            return;
        }

        hideEmptyState();

        const fragment =
            document.createDocumentFragment();

        tests.forEach((test) => {
            const row =
                document.createElement("tr");

            row.dataset.testId = test.id;

            row.innerHTML = `
                <td>
                    <div class="laboratory-test-name-cell">
                        <div class="laboratory-test-avatar">
                            <i class="bi bi-eyedropper"></i>
                        </div>

                        <div>
                            <div class="laboratory-test-name">
                                ${escapeHtml(
                                    test.testName
                                )}
                            </div>

                            <div class="laboratory-test-code">
                                ${escapeHtml(
                                    test.testCode
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="laboratory-category">
                        ${escapeHtml(
                            test.category
                        )}
                    </span>
                </td>

                <td>
                    <span class="laboratory-sample-type">
                        ${escapeHtml(
                            test.sampleType
                        )}
                    </span>
                </td>

                <td>
                    ${getPreparationBadge(test)}
                </td>

                <td>
                    <span class="laboratory-turnaround">
                        ${escapeHtml(
                            test.turnaroundTime
                        )}
                    </span>
                </td>

                <td>
                    <span class="laboratory-price">
                        Rs. ${formatCurrency(
                            test.price
                        )}
                    </span>
                </td>

                <td>
                    ${getStatusBadge(
                        test.status
                    )}
                </td>

                <td>
                    <div class="laboratory-row-actions">

                        <button
                            type="button"
                            class="laboratory-row-action view"
                            data-action="view"
                            data-id="${escapeHtml(
                                test.id
                            )}"
                            title="View test"
                            aria-label="View test"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="laboratory-row-action edit"
                            data-action="edit"
                            data-id="${escapeHtml(
                                test.id
                            )}"
                            title="Edit test"
                            aria-label="Edit test"
                        >
                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button
                            type="button"
                            class="laboratory-row-action delete"
                            data-action="delete"
                            data-id="${escapeHtml(
                                test.id
                            )}"
                            title="Delete test"
                            aria-label="Delete test"
                        >
                            <i class="bi bi-trash3"></i>
                        </button>

                    </div>
                </td>
            `;

            fragment.appendChild(row);
        });

        elements.tableBody.appendChild(
            fragment
        );

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.remove(
                "d-none"
            );
        }

        updateCount();
    }

    function showLoading() {
        if (elements.loading) {
            elements.loading.classList.remove(
                "d-none"
            );
        }

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.add(
                "d-none"
            );
        }

        if (elements.empty) {
            elements.empty.classList.add(
                "d-none"
            );
        }
    }

    function hideLoading() {
        if (elements.loading) {
            elements.loading.classList.add(
                "d-none"
            );
        }
    }

    function showEmptyState() {
        hideLoading();

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.add(
                "d-none"
            );
        }

        if (elements.empty) {
            elements.empty.classList.remove(
                "d-none"
            );
        }
    }

    function hideEmptyState() {
        if (elements.empty) {
            elements.empty.classList.add(
                "d-none"
            );
        }
    }

    function showTableState() {
        hideLoading();
        hideEmptyState();

        if (elements.tableWrapper) {
            elements.tableWrapper.classList.remove(
                "d-none"
            );
        }
    }

    function applyFilters() {
        const {
            search,
            category,
            status
        } = state.currentFilter;

        const searchTerm =
            String(search || "")
                .trim()
                .toLowerCase();

        state.filteredTests =
            state.tests.filter(
                (test) => {
                    const matchesSearch =
                        !searchTerm ||
                        [
                            test.testName,
                            test.testCode,
                            test.category,
                            test.sampleType,
                            test.description
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                searchTerm
                            );

                    const matchesCategory =
                        !category ||
                        test.category ===
                            category;

                    const matchesStatus =
                        !status ||
                        test.status === status;

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesStatus
                    );
                }
            );

        renderTable();
    }

    function setFilter(
        name,
        value
    ) {
        if (
            !Object.prototype.hasOwnProperty.call(
                state.currentFilter,
                name
            )
        ) {
            return;
        }

        state.currentFilter[name] =
            value || "";

        applyFilters();
    }

    function clearFilters() {
        state.currentFilter = {
            search: "",
            category: "",
            status: ""
        };

        const search =
            document.getElementById(
                "labTestSearch"
            );

        const category =
            document.getElementById(
                "labTestCategoryFilter"
            );

        const status =
            document.getElementById(
                "labTestStatusFilter"
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

        applyFilters();
    }

    function renderCategoryOptions(
        categories = []
    ) {
        const select =
            document.getElementById(
                "labTestCategoryFilter"
            );

        if (!select) {
            return;
        }

        const currentValue =
            select.value;

        const uniqueCategories =
            Array.from(
                new Set(
                    categories
                        .map((category) =>
                            String(
                                category || ""
                            ).trim()
                        )
                        .filter(Boolean)
                )
            ).sort(
                (a, b) =>
                    a.localeCompare(b)
            );

        select.innerHTML = `
            <option value="">
                All categories
            </option>
        `;

        uniqueCategories.forEach(
            (category) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value = category;
                option.textContent =
                    category;

                select.appendChild(
                    option
                );
            }
        );

        if (
            uniqueCategories.includes(
                currentValue
            )
        ) {
            select.value =
                currentValue;
        }
    }

    function populateCategoryFilterFromTests() {
        const categories =
            state.tests.map(
                (test) =>
                    test.category
            );

        renderCategoryOptions(
            categories
        );
    }

    function renderViewDetails(test) {
        if (!elements.details) {
            return;
        }

        if (!test) {
            elements.details.innerHTML = `
                <div class="laboratory-empty-detail">
                    <i class="bi bi-exclamation-circle"></i>
                    <p>Laboratory test details are unavailable.</p>
                </div>
            `;

            return;
        }

        const preparationText =
            test.preparationRequired
                ? "Preparation required"
                : "No preparation required";

        elements.details.innerHTML = `
            <div class="laboratory-detail-header">

                <div class="laboratory-detail-icon">
                    <i class="bi bi-eyedropper"></i>
                </div>

                <div>
                    <div class="laboratory-detail-title">
                        ${escapeHtml(
                            test.testName
                        )}
                    </div>

                    <div class="laboratory-detail-code">
                        ${escapeHtml(
                            test.testCode
                        )}
                    </div>
                </div>

                <div class="laboratory-detail-status">
                    ${getStatusBadge(
                        test.status
                    )}
                </div>

            </div>

            <div class="laboratory-detail-grid">

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Category
                    </span>
                    <strong>
                        ${escapeHtml(
                            test.category
                        )}
                    </strong>
                </div>

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Sample Type
                    </span>
                    <strong>
                        ${escapeHtml(
                            test.sampleType
                        )}
                    </strong>
                </div>

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Turnaround Time
                    </span>
                    <strong>
                        ${escapeHtml(
                            test.turnaroundTime
                        )}
                    </strong>
                </div>

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Price
                    </span>
                    <strong>
                        Rs. ${formatCurrency(
                            test.price
                        )}
                    </strong>
                </div>

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Preparation
                    </span>
                    <strong>
                        ${escapeHtml(
                            preparationText
                        )}
                    </strong>
                </div>

                <div class="laboratory-detail-item">
                    <span class="detail-label">
                        Created
                    </span>
                    <strong>
                        ${formatDate(
                            test.createdAt
                        )}
                    </strong>
                </div>

            </div>

            ${
                test.description
                    ? `
                        <div class="laboratory-detail-section">
                            <div class="detail-section-title">
                                Description
                            </div>

                            <p>
                                ${escapeHtml(
                                    test.description
                                )}
                            </p>
                        </div>
                    `
                    : ""
            }

            ${
                test.preparationRequired &&
                test.preparationInstructions
                    ? `
                        <div class="laboratory-detail-section">
                            <div class="detail-section-title">
                                Preparation Instructions
                            </div>

                            <p>
                                ${escapeHtml(
                                    test.preparationInstructions
                                )}
                            </p>
                        </div>
                    `
                    : ""
            }

            ${
                test.updatedAt
                    ? `
                        <div class="laboratory-detail-meta">
                            Last updated:
                            ${formatDate(
                                test.updatedAt
                            )}
                        </div>
                    `
                    : ""
            }
        `;
    }

    function findTestById(id) {
        return state.tests.find(
            (test) =>
                String(test.id) ===
                String(id)
        );
    }

    function selectTest(id) {
        const test =
            findTestById(id);

        state.selectedTest =
            test || null;

        renderViewDetails(
            state.selectedTest
        );

        return state.selectedTest;
    }

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
                : "success";

        const iconMap = {
            success: "check-circle",
            danger: "x-circle",
            warning: "exclamation-triangle",
            info: "info-circle"
        };

        const toast =
            document.createElement(
                "div"
            );

        toast.className =
            `laboratory-toast ${toastType}`;

        toast.setAttribute(
            "role",
            "alert"
        );

        toast.innerHTML = `
            <div class="laboratory-toast-icon">
                <i class="bi bi-${
                    iconMap[toastType]
                }"></i>
            </div>

            <div class="laboratory-toast-message">
                ${escapeHtml(message)}
            </div>

            <button
                type="button"
                class="laboratory-toast-close"
                aria-label="Close notification"
            >
                <i class="bi bi-x"></i>
            </button>
        `;

        elements.toastContainer.appendChild(
            toast
        );

        const closeButton =
            toast.querySelector(
                ".laboratory-toast-close"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                () => {
                    removeToast(toast);
                }
            );
        }

        window.setTimeout(() => {
            removeToast(toast);
        }, 4500);
    }

    function removeToast(toast) {
        if (!toast) {
            return;
        }

        toast.classList.add(
            "removing"
        );

        window.setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(
                    toast
                );
            }
        }, 200);
    }

    async function loadTests(
        params = {}
    ) {
        showLoading();

        try {
            const response =
                await laboratoryData.getLabTests(
                    params
                );

            const tests =
                laboratoryData.extractArray(
                    response,
                    [
                        "tests",
                        "labTests",
                        "laboratoryTests",
                        "items",
                        "records"
                    ]
                );

            state.tests =
                normalizeTests(tests);

            populateCategoryFilterFromTests();
            updateSummary();
            applyFilters();
            hideLoading();

            if (
                state.filteredTests.length
            ) {
                showTableState();
            }

            return state.tests;
        } catch (error) {
            console.error(
                "Failed to load laboratory tests:",
                error
            );

            state.tests = [];
            state.filteredTests = [];

            updateSummary();
            updateCount();

            hideLoading();
            showEmptyState();

            const message =
                error.response?.data?.message ||
                "Unable to load laboratory tests.";

            showToast(
                message,
                "danger"
            );

            throw error;
        }
    }

    function setTests(tests = []) {
        state.tests =
            normalizeTests(tests);

        populateCategoryFilterFromTests();
        updateSummary();
        applyFilters();

        return state.tests;
    }

    function addTest(test) {
        const normalized =
            normalizeTest(test);

        if (!normalized.id) {
            return null;
        }

        const existingIndex =
            state.tests.findIndex(
                (item) =>
                    String(item.id) ===
                    String(normalized.id)
            );

        if (existingIndex >= 0) {
            state.tests[
                existingIndex
            ] = normalized;
        } else {
            state.tests.push(
                normalized
            );
        }

        populateCategoryFilterFromTests();
        updateSummary();
        applyFilters();

        return normalized;
    }

    function removeTest(id) {
        state.tests =
            state.tests.filter(
                (test) =>
                    String(test.id) !==
                    String(id)
            );

        if (
            state.selectedTest &&
            String(
                state.selectedTest.id
            ) === String(id)
        ) {
            state.selectedTest = null;
        }

        populateCategoryFilterFromTests();
        updateSummary();
        applyFilters();
    }

    function handleTableAction(
        action,
        id
    ) {
        if (!action || !id) {
            return;
        }

        const test =
            findTestById(id);

        if (!test) {
            return;
        }

        if (action === "view") {
            selectTest(id);

            const modalElement =
                document.getElementById(
                    "viewLabTestModal"
                );

            if (
                modalElement &&
                window.bootstrap
            ) {
                const modal =
                    window.bootstrap.Modal.getOrCreateInstance(
                        modalElement
                    );

                modal.show();
            }

            return;
        }

        if (action === "edit") {
            const event =
                new CustomEvent(
                    "medicore:laboratory:edit",
                    {
                        detail: {
                            test
                        }
                    }
                );

            document.dispatchEvent(
                event
            );

            return;
        }

        if (action === "delete") {
            const event =
                new CustomEvent(
                    "medicore:laboratory:delete",
                    {
                        detail: {
                            test
                        }
                    }
                );

            document.dispatchEvent(
                event
            );
        }
    }

    function bindTableActions() {
        if (!elements.tableBody) {
            return;
        }

        elements.tableBody.addEventListener(
            "click",
            (event) => {
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

                handleTableAction(
                    action,
                    id
                );
            }
        );
    }

    function bindFilters() {
        const search =
            document.getElementById(
                "labTestSearch"
            );

        const category =
            document.getElementById(
                "labTestCategoryFilter"
            );

        const status =
            document.getElementById(
                "labTestStatusFilter"
            );

        const clear =
            document.getElementById(
                "clearLabTestFilters"
            );

        if (search) {
            search.addEventListener(
                "input",
                () => {
                    setFilter(
                        "search",
                        search.value
                    );
                }
            );
        }

        if (category) {
            category.addEventListener(
                "change",
                () => {
                    setFilter(
                        "category",
                        category.value
                    );
                }
            );
        }

        if (status) {
            status.addEventListener(
                "change",
                () => {
                    setFilter(
                        "status",
                        status.value
                    );
                }
            );
        }

        if (clear) {
            clear.addEventListener(
                "click",
                clearFilters
            );
        }
    }

    function bindQuickStatusFilters() {
        const activeButton =
            document.getElementById(
                "activeLabTestsBtn"
            );

        const inactiveButton =
            document.getElementById(
                "inactiveLabTestsBtn"
            );

        if (activeButton) {
            activeButton.addEventListener(
                "click",
                () => {
                    setFilter(
                        "status",
                        "active"
                    );
                }
            );
        }

        if (inactiveButton) {
            inactiveButton.addEventListener(
                "click",
                () => {
                    setFilter(
                        "status",
                        "inactive"
                    );
                }
            );
        }
    }

    function init() {
        bindTableActions();
        bindFilters();
        bindQuickStatusFilters();

        updateSummary();
        updateCount();
    }

    const laboratoryUI = {
        state,
        init,
        loadTests,
        setTests,
        addTest,
        removeTest,
        findTestById,
        selectTest,
        renderTable,
        renderViewDetails,
        applyFilters,
        clearFilters,
        setFilter,
        updateSummary,
        updateCount,
        showLoading,
        hideLoading,
        showEmptyState,
        hideEmptyState,
        showTableState,
        showToast,
        formatCurrency,
        formatDate,
        escapeHtml,
        normalizeTest,
        normalizeTests
    };

    window.mediCoreLaboratoryUI =
        laboratoryUI;

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();