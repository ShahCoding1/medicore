/* ============================================================
   MEDICORE — ONBOARDING
   Step 1: Hospital
   Step 2: Departments
   Step 3: Staff foundation
============================================================ */

const API_BASE_URL = "http://localhost:5000/api";

let currentStep = 1;

let hospitalLoaded = false;

let departments = [];
let editingDepartmentId = null;

let departmentModalInstance = null;


/* ============================================================
   DOM HELPERS
============================================================ */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* ============================================================
   AUTH
============================================================ */

function getAuthToken() {
    return (
        localStorage.getItem("medicore_token") ||
        sessionStorage.getItem("medicore_token")
    );
}

function getAuthHeaders() {
    const token = getAuthToken();

    return token
        ? {
              Authorization: `Bearer ${token}`
          }
        : {};
}

function ensureAuthenticated() {
    const token = getAuthToken();

    if (!token) {
        window.location.href = "../login.html";
        return false;
    }

    return true;
}


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    if (!ensureAuthenticated()) {
        return;
    }

    setYears();

    initializeDepartmentModal();

    setupGlobalEvents();

    setupHospitalEvents();

    setupDepartmentEvents();

    setupStepNavigation();

    currentStep = getRequestedStep();

    renderStep(currentStep);

    if (currentStep === 1) {
        await loadExistingHospital();
    }

    if (currentStep === 2) {
        await loadExistingHospital();
        await loadDepartments();
    }
});


/* ============================================================
   YEARS
============================================================ */

function setYears() {
    const year = new Date().getFullYear();

    const currentYear = $("#currentYear");
    const sidebarYear = $("#sidebarYear");

    if (currentYear) {
        currentYear.textContent = year;
    }

    if (sidebarYear) {
        sidebarYear.textContent = year;
    }
}


/* ============================================================
   STEP ROUTING
============================================================ */

function getRequestedStep() {

    const params = new URLSearchParams(window.location.search);

    const requested = Number(params.get("step"));

    if ([1, 2, 3, 4, 5].includes(requested)) {
        return requested;
    }

    return 1;
}


function updateStepUrl(step) {

    const url = new URL(window.location.href);

    url.searchParams.set("step", String(step));

    window.history.replaceState(
        {},
        "",
        `${url.pathname}?${url.searchParams.toString()}`
    );
}


function renderStep(step) {

    currentStep = step;

    const panels = [
        $("#stepPanel1"),
        $("#stepPanel2"),
        $("#stepPanel3"),
        $("#stepPanel4"),
        $("#stepPanel5")
    ];

    panels.forEach((panel) => {
        if (panel) {
            panel.classList.add("d-none");
        }
    });

    const activePanel = panels[step - 1];

    if (activePanel) {
        activePanel.classList.remove("d-none");
    }

    updateProgressNavigation(step);

    updateStepUrl(step);
}


function updateProgressNavigation(step) {

    for (let i = 1; i <= 5; i++) {

        const button = $(`#stepNavigation${i}`);

        if (!button) {
            continue;
        }

        button.classList.remove("active", "completed");

        const icon = button.querySelector(".step-state i");

        if (i < step) {

            button.classList.add("completed");

            if (icon) {
                icon.className = "bi bi-check2-circle";
            }

        } else if (i === step) {

            button.classList.add("active");

            if (icon) {
                icon.className = "bi bi-record-circle";
            }

        } else {

            if (icon) {
                icon.className = "bi bi-circle";
            }
        }
    }
}


/* ============================================================
   STEP NAVIGATION
============================================================ */

function setupStepNavigation() {

    $$(".progress-step").forEach((button) => {

        button.addEventListener("click", async () => {

            const requestedStep = Number(
                button.dataset.step
            );

            /*
             * Only completed/current onboarding sections are
             * navigable. Future sections remain locked.
             */

            if (requestedStep <= currentStep) {

                if (requestedStep === 1) {
                    renderStep(1);
                    return;
                }

                if (requestedStep === 2) {
                    renderStep(2);
                    await loadDepartments();
                }
            }
        });
    });
}


/* ============================================================
   GLOBAL EVENTS
============================================================ */

function setupGlobalEvents() {

    $("#closeErrorAlert")?.addEventListener(
        "click",
        () => hideError()
    );

    $("#closeSuccessAlert")?.addEventListener(
        "click",
        () => hideSuccess()
    );

    $("#saveAndExitBtn")?.addEventListener(
        "click",
        handleSaveAndExit
    );
}


/* ============================================================
   SAVE & EXIT
============================================================ */

function handleSaveAndExit() {

    /*
     * Onboarding is intentionally not marked complete here.
     * The workspace remains authenticated, but setup can be
     * resumed later.
     */

    window.location.href = "../pages/dashboard.html";
}


/* ============================================================
   HOSPITAL — EVENTS
============================================================ */

function setupHospitalEvents() {

    $("#hospitalOnboardingForm")?.addEventListener(
        "submit",
        handleHospitalSubmit
    );

    $("#hospitalBackButton")?.addEventListener(
        "click",
        () => {
            window.location.href = "../login.html";
        }
    );
}


/* ============================================================
   HOSPITAL — LOAD
============================================================ */

async function loadExistingHospital() {

    if (!window.mediCoreAPI) {
        showError(
            "The MediCore API client is not available. Please refresh the page."
        );

        return;
    }

    try {

        const response =
            await window.mediCoreAPI.get(
                "/hospitals/me"
            );

        const payload = response?.data?.data;

        const hospital =
            payload?.hospital ||
            response?.data?.hospital ||
            payload;

        if (!hospital) {
            return;
        }

        hospitalLoaded = true;

        setValue(
            "#hospitalName",
            hospital.name
        );

        setValue(
            "#hospitalType",
            hospital.type
        );

        setValue(
            "#registrationNumber",
            hospital.registrationNumber
        );

        setValue(
            "#hospitalCountry",
            hospital.country || "Pakistan"
        );

        setValue(
            "#hospitalCity",
            hospital.city
        );

        setValue(
            "#hospitalAddress",
            hospital.address
        );

        setValue(
            "#hospitalPhone",
            hospital.phone
        );

        setValue(
            "#hospitalEmail",
            hospital.email
        );

        setValue(
            "#hospitalWebsite",
            hospital.website
        );

    } catch (error) {

        /*
         * A 404 simply means there is no hospital profile yet.
         * Other errors are displayed.
         */

        if (error.response?.status === 404) {
            hospitalLoaded = false;
            return;
        }

        if (error.response?.status === 401) {
            handleUnauthorized();
            return;
        }

        console.error(
            "Hospital loading error:",
            error
        );
    }
}


/* ============================================================
   HOSPITAL — SUBMIT
============================================================ */

async function handleHospitalSubmit(event) {

    event.preventDefault();

    clearHospitalErrors();
    hideError();
    hideSuccess();

    const hospitalData = {
        name: getValue("#hospitalName"),
        type: getValue("#hospitalType"),
        registrationNumber:
            getValue("#registrationNumber"),

        country:
            getValue("#hospitalCountry"),

        city:
            getValue("#hospitalCity"),

        address:
            getValue("#hospitalAddress"),

        phone:
            getValue("#hospitalPhone"),

        email:
            getValue("#hospitalEmail"),

        website:
            getValue("#hospitalWebsite")
    };

    if (!validateHospital(hospitalData)) {
        return;
    }

    setHospitalLoading(true);

    try {

        /*
         * Existing MediCore onboarding endpoint.
         * The current backend uses POST /hospitals for
         * initial workspace creation.
         */

        const response =
            await window.mediCoreAPI.post(
                "/hospitals",
                hospitalData
            );

        if (!response?.data?.success) {

            throw new Error(
                response?.data?.message ||
                "Unable to save hospital information."
            );
        }

        hospitalLoaded = true;

        showSuccess(
            "Hospital information saved. Moving to Departments..."
        );

        setTimeout(
            async () => {

                renderStep(2);

                await loadDepartments();

            },
            700
        );

    } catch (error) {

        console.error(
            "Hospital save error:",
            error
        );

        if (error.response?.status === 401) {
            handleUnauthorized();
            return;
        }

        showError(
            error.response?.data?.message ||
            error.message ||
            "Unable to save hospital information."
        );

    } finally {

        setHospitalLoading(false);
    }
}


/* ============================================================
   HOSPITAL — VALIDATION
============================================================ */

function validateHospital(data) {

    let valid = true;

    if (!data.name) {
        setFieldError(
            "#hospitalName",
            "#hospitalNameError",
            "Hospital name is required."
        );

        valid = false;
    }

    if (!data.type) {
        setFieldError(
            "#hospitalType",
            "#hospitalTypeError",
            "Please select the hospital type."
        );

        valid = false;
    }

    if (!data.country) {
        setFieldError(
            "#hospitalCountry",
            "#hospitalCountryError",
            "Country is required."
        );

        valid = false;
    }

    if (!data.city) {
        setFieldError(
            "#hospitalCity",
            "#hospitalCityError",
            "City is required."
        );

        valid = false;
    }

    if (!data.address) {
        setFieldError(
            "#hospitalAddress",
            "#hospitalAddressError",
            "Hospital address is required."
        );

        valid = false;
    }

    if (!data.phone) {
        setFieldError(
            "#hospitalPhone",
            "#hospitalPhoneError",
            "Hospital phone is required."
        );

        valid = false;
    }

    if (!data.email) {

        setFieldError(
            "#hospitalEmail",
            "#hospitalEmailError",
            "Hospital email is required."
        );

        valid = false;

    } else if (!isValidEmail(data.email)) {

        setFieldError(
            "#hospitalEmail",
            "#hospitalEmailError",
            "Please enter a valid email address."
        );

        valid = false;
    }

    if (
        data.website &&
        !isValidWebsite(data.website)
    ) {

        setFieldError(
            "#hospitalWebsite",
            "#hospitalWebsiteError",
            "Please enter a valid website URL."
        );

        valid = false;
    }

    return valid;
}


/* ============================================================
   HOSPITAL — LOADING
============================================================ */

function setHospitalLoading(loading) {

    const button =
        $("#hospitalContinueButton");

    const text =
        $("#hospitalContinueButtonText");

    const spinner =
        $("#hospitalContinueSpinner");

    const arrow =
        $("#hospitalContinueArrow");

    if (!button) {
        return;
    }

    button.disabled = loading;

    if (loading) {

        if (text) {
            text.textContent = "Saving...";
        }

        spinner?.classList.remove("d-none");
        arrow?.classList.add("d-none");

    } else {

        if (text) {
            text.textContent = "Continue";
        }

        spinner?.classList.add("d-none");
        arrow?.classList.remove("d-none");
    }
}


/* ============================================================
   DEPARTMENT — INITIALIZE MODAL
============================================================ */

function initializeDepartmentModal() {

    const modalElement =
        $("#departmentModal");

    if (
        modalElement &&
        window.bootstrap
    ) {

        departmentModalInstance =
            new bootstrap.Modal(
                modalElement,
                {
                    backdrop: "static"
                }
            );
    }
}


/* ============================================================
   DEPARTMENT — EVENTS
============================================================ */

function setupDepartmentEvents() {

    $("#addDepartmentButton")?.addEventListener(
        "click",
        () => openDepartmentModal()
    );

    $("#emptyAddDepartmentButton")?.addEventListener(
        "click",
        () => openDepartmentModal()
    );

    $("#departmentForm")?.addEventListener(
        "submit",
        handleDepartmentSubmit
    );

    $("#departmentBackButton")?.addEventListener(
        "click",
        () => {
            renderStep(1);
        }
    );

    $("#departmentContinueButton")?.addEventListener(
        "click",
        handleDepartmentContinue
    );

    $("#departmentSearch")?.addEventListener(
        "input",
        debounce(
            () => loadDepartments(),
            300
        )
    );

    $("#departmentStatusFilter")?.addEventListener(
        "change",
        () => loadDepartments()
    );

    $("#retryDepartmentsButton")?.addEventListener(
        "click",
        () => loadDepartments()
    );

    $("#futureStep3BackButton")?.addEventListener(
        "click",
        () => {
            renderStep(2);
            loadDepartments();
        }
    );

    $("#departmentCode")?.addEventListener(
        "input",
        (event) => {
            event.target.value =
                event.target.value
                    .toUpperCase()
                    .replace(/\s+/g, "");
        }
    );

    [
        "#departmentName",
        "#departmentCode"
    ].forEach((selector) => {

        $(selector)?.addEventListener(
            "input",
            () => clearDepartmentFieldError(
                selector
            )
        );
    });
}


/* ============================================================
   DEPARTMENT — LOAD
============================================================ */

async function loadDepartments() {

    if (!window.mediCoreAPI) {
        showDepartmentError(
            "The MediCore API client is not available."
        );

        return;
    }

    setDepartmentLoading(true);

    hideDepartmentError();

    try {

        const search =
            getValue("#departmentSearch");

        const status =
            getValue("#departmentStatusFilter");

        const params = {};

        if (search) {
            params.search = search;
        }

        if (status) {
            params.status = status;
        }

        const response =
            await window.mediCoreAPI.get(
                "/departments",
                { params }
            );

        const payload =
            response?.data?.data;

        const list =
            payload?.departments ||
            response?.data?.departments ||
            payload ||
            response?.data;

        departments =
            Array.isArray(list)
                ? list
                : [];

        renderDepartments();

    } catch (error) {

        console.error(
            "Department loading error:",
            error
        );

        if (error.response?.status === 401) {
            handleUnauthorized();
            return;
        }

        showDepartmentError(
            error.response?.data?.message ||
            "Unable to load departments."
        );

    } finally {

        setDepartmentLoading(false);
    }
}


/* ============================================================
   DEPARTMENT — RENDER
============================================================ */

function renderDepartments() {

    const tbody =
        $("#departmentTableBody");

    const emptyState =
        $("#departmentEmptyState");

    const table =
        $(".department-table");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const count =
        $("#departmentCount");

    if (count) {
        count.textContent =
            departments.length;
    }

    if (!departments.length) {

        emptyState?.classList.remove(
            "d-none"
        );

        if (table) {
            table.querySelector("thead")
                ?.classList.add("d-none");
        }

        return;
    }

    emptyState?.classList.add(
        "d-none"
    );

    if (table) {
        table.querySelector("thead")
            ?.classList.remove("d-none");
    }

    departments.forEach(
        (department) => {

            const row =
                document.createElement("tr");

            const name =
                escapeHtml(
                    department.name || "Unnamed"
                );

            const description =
                escapeHtml(
                    department.description || ""
                );

            const code =
                escapeHtml(
                    department.code || "—"
                );

            const phone =
                escapeHtml(
                    department.phone || "—"
                );

            const location =
                escapeHtml(
                    department.location || "—"
                );

            const status =
                department.status === "inactive"
                    ? "inactive"
                    : "active";

            const statusLabel =
                status === "active"
                    ? "Active"
                    : "Inactive";

            const id =
                escapeHtml(
                    department._id ||
                    department.id ||
                    ""
                );

            const initials =
                getInitials(
                    department.name
                );

            row.innerHTML = `
                <td>
                    <div class="department-name-cell">

                        <div class="department-avatar">
                            ${initials}
                        </div>

                        <div>
                            <strong>
                                ${name}
                            </strong>

                            ${
                                description
                                    ? `<small>${description}</small>`
                                    : ""
                            }
                        </div>

                    </div>
                </td>

                <td>
                    <span class="code-badge">
                        ${code}
                    </span>
                </td>

                <td>
                    ${phone}
                </td>

                <td>
                    ${location}
                </td>

                <td>
                    <span
                        class="status-badge status-${status}"
                    >
                        ${statusLabel}
                    </span>
                </td>

                <td>
                    <div class="table-actions">

                        <button
                            type="button"
                            class="table-action"
                            title="Edit department"
                            data-action="edit"
                            data-id="${id}"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="table-action delete"
                            title="Delete department"
                            data-action="delete"
                            data-id="${id}"
                        >
                            <i class="bi bi-trash3"></i>
                        </button>

                    </div>
                </td>
            `;

            tbody.appendChild(row);
        }
    );

    tbody
        .querySelectorAll("[data-action]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const action =
                        button.dataset.action;

                    if (action === "edit") {
                        openDepartmentModal(id);
                    }

                    if (action === "delete") {
                        deleteDepartment(id);
                    }
                }
            );
        });
}


/* ============================================================
   DEPARTMENT — MODAL
============================================================ */

function openDepartmentModal(
    departmentId = null
) {

    editingDepartmentId =
        departmentId || null;

    clearDepartmentForm();
    hideDepartmentFormAlert();

    const title =
        $("#departmentModalLabel");

    const code =
        $("#departmentCode");

    if (departmentId) {

        const department =
            departments.find(
                (item) =>
                    String(
                        item._id ||
                        item.id
                    ) === String(departmentId)
            );

        if (!department) {
            showError(
                "The selected department could not be found."
            );

            return;
        }

        title.textContent =
            "Edit Department";

        setValue(
            "#departmentName",
            department.name
        );

        setValue(
            "#departmentCode",
            department.code
        );

        setValue(
            "#departmentDescription",
            department.description
        );

        setValue(
            "#departmentPhone",
            department.phone
        );

        setValue(
            "#departmentLocation",
            department.location
        );

        setValue(
            "#departmentStatus",
            department.status || "active"
        );

        if (code) {
            code.disabled = true;
        }

        $("#saveDepartmentButtonText")
            .textContent =
            "Update Department";

    } else {

        title.textContent =
            "Add Department";

        if (code) {
            code.disabled = false;
        }

        $("#saveDepartmentButtonText")
            .textContent =
            "Save Department";
    }

    if (departmentModalInstance) {

        departmentModalInstance.show();

    } else {

        const modalElement =
            $("#departmentModal");

        if (modalElement) {

            modalElement.classList.add(
                "show"
            );

            modalElement.style.display =
                "block";
        }
    }
}


/* ============================================================
   DEPARTMENT — SAVE / UPDATE
============================================================ */

async function handleDepartmentSubmit(
    event
) {

    event.preventDefault();

    clearDepartmentErrors();
    hideDepartmentFormAlert();

    const name =
        getValue("#departmentName");

    const code =
        getValue("#departmentCode")
            .toUpperCase()
            .replace(/\s+/g, "");

    const description =
        getValue("#departmentDescription");

    const phone =
        getValue("#departmentPhone");

    const location =
        getValue("#departmentLocation");

    const status =
        getValue("#departmentStatus") ||
        "active";

    if (!validateDepartment({
        name,
        code
    })) {
        return;
    }

    setDepartmentFormLoading(true);

    try {

        let response;

        if (editingDepartmentId) {

            response =
                await window.mediCoreAPI.put(
                    `/departments/${editingDepartmentId}`,
                    {
                        name,
                        description,
                        phone,
                        location,
                        status
                    }
                );

        } else {

            response =
                await window.mediCoreAPI.post(
                    "/departments",
                    {
                        name,
                        code,
                        description,
                        phone,
                        location,
                        status
                    }
                );
        }

        if (!response?.data?.success) {

            throw new Error(
                response?.data?.message ||
                "Unable to save department."
            );
        }

        closeDepartmentModal();

        showSuccess(
            editingDepartmentId
                ? "Department updated successfully."
                : "Department created successfully."
        );

        editingDepartmentId = null;

        await loadDepartments();

    } catch (error) {

        console.error(
            "Department save error:",
            error
        );

        if (error.response?.status === 401) {
            handleUnauthorized();
            return;
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            "Unable to save department.";

        /*
         * Duplicate department/code errors are shown
         * directly inside the modal.
         */

        if (
            error.response?.status === 409 ||
            /already exists|duplicate/i.test(
                message
            )
        ) {

            showDepartmentFormAlert(
                message
            );

        } else {

            showDepartmentFormAlert(
                message
            );
        }

    } finally {

        setDepartmentFormLoading(false);
    }
}


/* ============================================================
   DEPARTMENT — VALIDATION
============================================================ */

function validateDepartment(data) {

    let valid = true;

    if (!data.name) {

        setDepartmentFieldError(
            "#departmentName",
            "#departmentNameError",
            "Department name is required."
        );

        valid = false;
    }

    if (!editingDepartmentId && !data.code) {

        setDepartmentFieldError(
            "#departmentCode",
            "#departmentCodeError",
            "Department code is required."
        );

        valid = false;
    }

    if (
        !editingDepartmentId &&
        data.code &&
        !/^[A-Z0-9_-]+$/.test(data.code)
    ) {

        setDepartmentFieldError(
            "#departmentCode",
            "#departmentCodeError",
            "Use only letters, numbers, hyphens or underscores."
        );

        valid = false;
    }

    return valid;
}


/* ============================================================
   DEPARTMENT — DELETE
============================================================ */

async function deleteDepartment(
    departmentId
) {

    const department =
        departments.find(
            (item) =>
                String(
                    item._id ||
                    item.id
                ) === String(departmentId)
        );

    if (!department) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete "${department.name}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await window.mediCoreAPI.delete(
                `/departments/${departmentId}`
            );

        if (!response?.data?.success) {

            throw new Error(
                response?.data?.message ||
                "Unable to delete department."
            );
        }

        showSuccess(
            "Department deleted successfully."
        );

        await loadDepartments();

    } catch (error) {

        console.error(
            "Department delete error:",
            error
        );

        if (error.response?.status === 401) {
            handleUnauthorized();
            return;
        }

        showError(
            error.response?.data?.message ||
            error.message ||
            "Unable to delete department."
        );
    }
}


/* ============================================================
   DEPARTMENT — CONTINUE
============================================================ */

function handleDepartmentContinue() {

    if (!departments.length) {

        showError(
            "Please add at least one department before continuing."
        );

        return;
    }

    /*
     * Step 3 is intentionally not activated yet.
     *
     * The onboarding workflow is being implemented one phase
     * at a time. We therefore confirm the department section
     * without making Staff operational in this step.
     */

    showSuccess(
        "Departments are saved. Staff setup will be enabled in the next onboarding phase."
    );
}


/* ============================================================
   DEPARTMENT — LOADING
============================================================ */

function setDepartmentLoading(
    loading
) {

    const indicator =
        $("#departmentLoading");

    if (!indicator) {
        return;
    }

    indicator.classList.toggle(
        "d-none",
        !loading
    );
}


function setDepartmentFormLoading(
    loading
) {

    const button =
        $("#saveDepartmentButton");

    const text =
        $("#saveDepartmentButtonText");

    const spinner =
        $("#saveDepartmentSpinner");

    const arrow =
        $("#saveDepartmentArrow");

    if (!button) {
        return;
    }

    button.disabled = loading;

    if (loading) {

        if (text) {
            text.textContent =
                editingDepartmentId
                    ? "Updating..."
                    : "Saving...";
        }

        spinner?.classList.remove(
            "d-none"
        );

        arrow?.classList.add(
            "d-none"
        );

    } else {

        if (text) {
            text.textContent =
                editingDepartmentId
                    ? "Update Department"
                    : "Save Department";
        }

        spinner?.classList.add(
            "d-none"
        );

        arrow?.classList.remove(
            "d-none"
        );
    }
}


/* ============================================================
   DEPARTMENT — FORM CLEAR
============================================================ */

function clearDepartmentForm() {

    setValue(
        "#departmentName",
        ""
    );

    setValue(
        "#departmentCode",
        ""
    );

    setValue(
        "#departmentDescription",
        ""
    );

    setValue(
        "#departmentPhone",
        ""
    );

    setValue(
        "#departmentLocation",
        ""
    );

    setValue(
        "#departmentStatus",
        "active"
    );

    clearDepartmentErrors();

    const code =
        $("#departmentCode");

    if (code) {
        code.disabled = false;
    }
}


function clearDepartmentErrors() {

    [
        "#departmentName",
        "#departmentCode"
    ].forEach(
        (selector) => {

            const field =
                $(selector);

            const group =
                field?.closest(
                    ".field-group"
                );

            group?.classList.remove(
                "has-error"
            );
        }
    );

    [
        "#departmentNameError",
        "#departmentCodeError"
    ].forEach(
        (selector) => {

            const element =
                $(selector);

            if (element) {
                element.textContent = "";
            }
        }
    );
}


function clearDepartmentFieldError(
    selector
) {

    const field =
        $(selector);

    const group =
        field?.closest(
            ".field-group"
        );

    group?.classList.remove(
        "has-error"
    );

    const error =
        selector === "#departmentName"
            ? $("#departmentNameError")
            : $("#departmentCodeError");

    if (error) {
        error.textContent = "";
    }
}


function setDepartmentFieldError(
    inputSelector,
    errorSelector,
    message
) {

    const input =
        $(inputSelector);

    const group =
        input?.closest(
            ".field-group"
        );

    group?.classList.add(
        "has-error"
    );

    const error =
        $(errorSelector);

    if (error) {
        error.textContent =
            message;
    }
}


/* ============================================================
   DEPARTMENT — FORM ALERT
============================================================ */

function showDepartmentFormAlert(
    message
) {

    const alert =
        $("#departmentFormAlert");

    const text =
        $("#departmentFormAlertText");

    if (!alert || !text) {
        return;
    }

    text.textContent = message;

    alert.classList.remove(
        "d-none"
    );
}


function hideDepartmentFormAlert() {

    $("#departmentFormAlert")
        ?.classList.add(
            "d-none"
        );
}


/* ============================================================
   DEPARTMENT — CLOSE MODAL
============================================================ */

function closeDepartmentModal() {

    if (departmentModalInstance) {

        departmentModalInstance.hide();

    } else {

        const modalElement =
            $("#departmentModal");

        if (modalElement) {

            modalElement.classList.remove(
                "show"
            );

            modalElement.style.display =
                "none";
        }
    }

    clearDepartmentForm();

    editingDepartmentId = null;
}


/* ============================================================
   ERROR / SUCCESS
============================================================ */

function showError(message) {

    const alert =
        $("#onboardingError");

    const text =
        $("#onboardingErrorText");

    if (!alert || !text) {
        return;
    }

    text.textContent =
        message;

    alert.classList.remove(
        "d-none"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function hideError() {

    $("#onboardingError")
        ?.classList.add(
            "d-none"
        );
}


function showSuccess(message) {

    const alert =
        $("#onboardingSuccess");

    const text =
        $("#onboardingSuccessText");

    if (!alert || !text) {
        return;
    }

    text.textContent =
        message;

    alert.classList.remove(
        "d-none"
    );
}


function hideSuccess() {

    $("#onboardingSuccess")
        ?.classList.add(
            "d-none"
        );
}


function showDepartmentError(
    message
) {

    const state =
        $("#departmentErrorState");

    const text =
        $("#departmentErrorText");

    const empty =
        $("#departmentEmptyState");

    const table =
        $(".department-table");

    if (state) {
        state.classList.remove(
            "d-none"
        );
    }

    if (empty) {
        empty.classList.add(
            "d-none"
        );
    }

    if (table) {
        table.classList.add(
            "d-none"
        );
    }

    if (text) {
        text.textContent =
            message;
    }
}


function hideDepartmentError() {

    const state =
        $("#departmentErrorState");

    const table =
        $(".department-table");

    if (state) {
        state.classList.add(
            "d-none"
        );
    }

    if (table) {
        table.classList.remove(
            "d-none"
        );
    }
}


/* ============================================================
   GENERIC HELPERS
============================================================ */

function getValue(selector) {

    const element =
        $(selector);

    return element
        ? element.value.trim()
        : "";
}


function setValue(
    selector,
    value
) {

    const element =
        $(selector);

    if (element) {
        element.value =
            value ?? "";
    }
}


function setFieldError(
    inputSelector,
    errorSelector,
    message
) {

    const input =
        $(inputSelector);

    const group =
        input?.closest(
            ".field-group"
        );

    group?.classList.add(
        "has-error"
    );

    const error =
        $(errorSelector);

    if (error) {
        error.textContent =
            message;
    }
}


function clearHospitalErrors() {

    const fields = [
        [
            "#hospitalName",
            "#hospitalNameError"
        ],
        [
            "#hospitalType",
            "#hospitalTypeError"
        ],
        [
            "#hospitalCountry",
            "#hospitalCountryError"
        ],
        [
            "#hospitalCity",
            "#hospitalCityError"
        ],
        [
            "#hospitalAddress",
            "#hospitalAddressError"
        ],
        [
            "#hospitalPhone",
            "#hospitalPhoneError"
        ],
        [
            "#hospitalEmail",
            "#hospitalEmailError"
        ],
        [
            "#hospitalWebsite",
            "#hospitalWebsiteError"
        ]
    ];

    fields.forEach(
        ([inputSelector, errorSelector]) => {

            const input =
                $(inputSelector);

            input
                ?.closest(".field-group")
                ?.classList.remove(
                    "has-error"
                );

            const error =
                $(errorSelector);

            if (error) {
                error.textContent = "";
            }
        }
    );
}


function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


function isValidWebsite(
    website
) {

    try {

        const url =
            new URL(
                website
            );

        return [
            "http:",
            "https:"
        ].includes(
            url.protocol
        );

    } catch {

        return false;
    }
}


function getInitials(
    name
) {

    if (!name) {
        return "D";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


function escapeHtml(
    value
) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function debounce(
    callback,
    delay
) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(
            () => callback(...args),
            delay
        );
    };
}


function handleUnauthorized() {

    localStorage.removeItem(
        "medicore_token"
    );

    localStorage.removeItem(
        "medicore_user"
    );

    sessionStorage.removeItem(
        "medicore_token"
    );

    sessionStorage.removeItem(
        "medicore_user"
    );

    window.location.href =
        "../login.html";
}