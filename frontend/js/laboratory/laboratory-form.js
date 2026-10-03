/* =========================================================
   MEDICORE — LABORATORY FORM
   Phase 13 — Laboratory Tests
   ========================================================= */

(function () {
    "use strict";

    const laboratoryData =
        window.mediCoreLaboratoryData;

    if (!laboratoryData) {
        console.error(
            "MediCore Laboratory Data layer is not available."
        );
        return;
    }

    const state = {
        mode: "create",
        editingId: null,
        saving: false
    };

    const elements = {
        form: document.getElementById(
            "labTestForm"
        ),

        modal: document.getElementById(
            "labTestModal"
        ),

        modalLabel: document.getElementById(
            "labTestModalLabel"
        ),

        name: document.getElementById(
            "labTestName"
        ),

        code: document.getElementById(
            "labTestCode"
        ),

        category: document.getElementById(
            "labTestCategory"
        ),

        sampleType: document.getElementById(
            "labTestSampleType"
        ),

        description: document.getElementById(
            "labTestDescription"
        ),

        preparationRequired:
            document.getElementById(
                "labTestPreparationRequired"
            ),

        preparationInstructions:
            document.getElementById(
                "labTestPreparationInstructions"
            ),

        turnaroundTime:
            document.getElementById(
                "labTestTurnaroundTime"
            ),

        price: document.getElementById(
            "labTestPrice"
        ),

        status: document.getElementById(
            "labTestStatus"
        ),

        alert: document.getElementById(
            "labTestFormAlert"
        ),

        saveButton: document.getElementById(
            "saveLabTestBtn"
        ),

        saveSpinner: document.getElementById(
            "saveLabTestSpinner"
        ),

        saveIcon: document.getElementById(
            "saveLabTestIcon"
        ),

        saveText: document.getElementById(
            "saveLabTestText"
        )
    };

    function showAlert(
        message,
        type = "danger"
    ) {
        if (!elements.alert) {
            return;
        }

        elements.alert.className =
            `alert alert-${type}`;

        elements.alert.innerHTML = `
            <div class="d-flex align-items-start gap-2">
                <i class="bi bi-${
                    type === "success"
                        ? "check-circle"
                        : "exclamation-circle"
                }-fill"></i>

                <div>
                    ${escapeHtml(message)}
                </div>
            </div>
        `;

        elements.alert.classList.remove(
            "d-none"
        );
    }

    function hideAlert() {
        if (!elements.alert) {
            return;
        }

        elements.alert.classList.add(
            "d-none"
        );

        elements.alert.textContent = "";
    }

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

    function setSaving(isSaving) {
        state.saving = isSaving;

        if (elements.saveButton) {
            elements.saveButton.disabled =
                isSaving;
        }

        if (elements.saveSpinner) {
            elements.saveSpinner.classList.toggle(
                "d-none",
                !isSaving
            );
        }

        if (elements.saveIcon) {
            elements.saveIcon.classList.toggle(
                "d-none",
                isSaving
            );
        }

        if (elements.saveText) {
            elements.saveText.textContent =
                isSaving
                    ? "Saving..."
                    : state.mode === "edit"
                        ? "Update Test"
                        : "Save Test";
        }
    }

    function clearValidation() {
        if (!elements.form) {
            return;
        }

        elements.form
            .querySelectorAll(
                ".is-invalid"
            )
            .forEach((field) => {
                field.classList.remove(
                    "is-invalid"
                );
            });
    }

    function markInvalid(
        element,
        message
    ) {
        if (!element) {
            return false;
        }

        element.classList.add(
            "is-invalid"
        );

        if (
            message &&
            element.parentElement
        ) {
            const existing =
                element.parentElement.querySelector(
                    ".invalid-feedback"
                );

            if (existing) {
                existing.textContent =
                    message;
            }
        }

        return false;
    }

    function validateForm() {
        clearValidation();
        hideAlert();

        const name =
            elements.name?.value.trim();

        const code =
            elements.code?.value.trim();

        const category =
            elements.category?.value.trim();

        const priceValue =
            elements.price?.value.trim();

        if (!name) {
            showAlert(
                "Please enter the laboratory test name."
            );

            markInvalid(
                elements.name,
                "Test name is required."
            );

            elements.name?.focus();

            return false;
        }

        if (name.length < 2) {
            showAlert(
                "Laboratory test name must contain at least 2 characters."
            );

            markInvalid(
                elements.name,
                "Minimum 2 characters."
            );

            elements.name?.focus();

            return false;
        }

        if (!code) {
            showAlert(
                "Please enter the laboratory test code."
            );

            markInvalid(
                elements.code,
                "Test code is required."
            );

            elements.code?.focus();

            return false;
        }

        if (code.length > 50) {
            showAlert(
                "Laboratory test code cannot exceed 50 characters."
            );

            markInvalid(
                elements.code,
                "Maximum 50 characters."
            );

            elements.code?.focus();

            return false;
        }

        if (!category) {
            showAlert(
                "Please enter the laboratory test category."
            );

            markInvalid(
                elements.category,
                "Category is required."
            );

            elements.category?.focus();

            return false;
        }

        if (
            priceValue === "" ||
            priceValue === null ||
            priceValue === undefined
        ) {
            showAlert(
                "Please enter the laboratory test price."
            );

            markInvalid(
                elements.price,
                "Price is required."
            );

            elements.price?.focus();

            return false;
        }

        const price =
            Number(priceValue);

        if (
            !Number.isFinite(price) ||
            price < 0
        ) {
            showAlert(
                "Please enter a valid price of 0 or greater."
            );

            markInvalid(
                elements.price,
                "Enter a valid non-negative price."
            );

            elements.price?.focus();

            return false;
        }

        return true;
    }

    function getFormPayload() {
        return {
            testName:
                elements.name?.value.trim() ||
                "",

            testCode:
                elements.code?.value
                    .trim()
                    .toUpperCase() ||
                "",

            category:
                elements.category?.value.trim() ||
                "",

            sampleType:
                elements.sampleType?.value.trim() ||
                "",

            description:
                elements.description?.value.trim() ||
                "",

            preparationRequired:
                Boolean(
                    elements
                        .preparationRequired
                        ?.checked
                ),

            preparationInstructions:
                elements.preparationInstructions
                    ?.value.trim() ||
                "",

            turnaroundTime:
                elements.turnaroundTime?.value.trim() ||
                "",

            price:
                Number(
                    elements.price?.value || 0
                ),

            status:
                elements.status?.value ||
                "active"
        };
    }

    function populateForm(test) {
        if (!test) {
            return;
        }

        if (elements.name) {
            elements.name.value =
                test.testName || "";
        }

        if (elements.code) {
            elements.code.value =
                test.testCode || "";
        }

        if (elements.category) {
            elements.category.value =
                test.category || "";
        }

        if (elements.sampleType) {
            elements.sampleType.value =
                test.sampleType || "";
        }

        if (elements.description) {
            elements.description.value =
                test.description || "";
        }

        if (
            elements.preparationRequired
        ) {
            elements.preparationRequired.checked =
                Boolean(
                    test.preparationRequired
                );
        }

        if (
            elements.preparationInstructions
        ) {
            elements.preparationInstructions.value =
                test.preparationInstructions ||
                "";
        }

        if (elements.turnaroundTime) {
            elements.turnaroundTime.value =
                test.turnaroundTime || "";
        }

        if (elements.price) {
            elements.price.value =
                Number(test.price || 0);
        }

        if (elements.status) {
            elements.status.value =
                test.status || "active";
        }

        updatePreparationState();
    }

    function resetForm() {
        state.mode = "create";
        state.editingId = null;

        if (elements.form) {
            elements.form.reset();
        }

        if (elements.status) {
            elements.status.value =
                "active";
        }

        if (
            elements.preparationRequired
        ) {
            elements.preparationRequired.checked =
                false;
        }

        updatePreparationState();

        clearValidation();
        hideAlert();
        setSaving(false);

        if (elements.modalLabel) {
            elements.modalLabel.textContent =
                "Add Laboratory Test";
        }
    }

    function openCreateForm() {
        resetForm();

        if (elements.modal) {
            const modal =
                window.bootstrap?.Modal.getOrCreateInstance(
                    elements.modal
                );

            modal?.show();
        }
    }

    function openEditForm(test) {
        if (!test || !test.id) {
            return;
        }

        state.mode = "edit";
        state.editingId =
            test.id;

        clearValidation();
        hideAlert();

        populateForm(test);

        if (elements.modalLabel) {
            elements.modalLabel.textContent =
                "Edit Laboratory Test";
        }

        setSaving(false);

        if (elements.modal) {
            const modal =
                window.bootstrap?.Modal.getOrCreateInstance(
                    elements.modal
                );

            modal?.show();
        }
    }

    function updatePreparationState() {
        const required =
            Boolean(
                elements
                    .preparationRequired
                    ?.checked
            );

        const field =
            elements
                .preparationInstructions;

        if (!field) {
            return;
        }

        field.disabled =
            !required;

        if (!required) {
            field.value = "";
        }
    }

    async function submitForm(event) {
        event.preventDefault();

        if (state.saving) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload =
            getFormPayload();

        setSaving(true);

        try {
            let response;

            if (
                state.mode === "edit" &&
                state.editingId
            ) {
                response =
                    await laboratoryData.updateLabTest(
                        state.editingId,
                        payload
                    );
            } else {
                response =
                    await laboratoryData.createLabTest(
                        payload
                    );
            }

            const test =
                response?.test ||
                response?.data?.test ||
                response?.data ||
                response;

            const message =
                state.mode === "edit"
                    ? "Laboratory test updated successfully."
                    : "Laboratory test created successfully.";

            laboratoryUIShowToast(
                message,
                "success"
            );

            document.dispatchEvent(
                new CustomEvent(
                    "medicore:laboratory:saved",
                    {
                        detail: {
                            test
                        }
                    }
                )
            );

            resetForm();

            if (
                window.bootstrap &&
                elements.modal
            ) {
                const modal =
                    window.bootstrap.Modal.getInstance(
                        elements.modal
                    );

                modal?.hide();
            }
        } catch (error) {
            console.error(
                "Failed to save laboratory test:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Unable to save laboratory test.";

            showAlert(
                message,
                "danger"
            );
        } finally {
            setSaving(false);
        }
    }

    function laboratoryUIShowToast(
        message,
        type
    ) {
        if (
            window.mediCoreLaboratoryUI &&
            typeof window
                .mediCoreLaboratoryUI
                .showToast ===
                "function"
        ) {
            window.mediCoreLaboratoryUI.showToast(
                message,
                type
            );
        }
    }

    function bindEvents() {
        if (elements.form) {
            elements.form.addEventListener(
                "submit",
                submitForm
            );
        }

        if (
            elements.preparationRequired
        ) {
            elements.preparationRequired.addEventListener(
                "change",
                updatePreparationState
            );
        }

        if (elements.code) {
            elements.code.addEventListener(
                "input",
                () => {
                    elements.code.value =
                        elements.code.value
                            .toUpperCase();
                }
            );
        }

        document.addEventListener(
            "medicore:laboratory:form-edit",
            (event) => {
                openEditForm(
                    event.detail?.test
                );
            }
        );

        document.addEventListener(
            "medicore:laboratory:create",
            () => {
                openCreateForm();
            }
        );
    }

    function init() {
        bindEvents();
        updatePreparationState();
    }

    window.mediCoreLaboratoryForm = {
        state,

        init,

        resetForm,

        openCreateForm,

        openEditForm,

        validateForm,

        getFormPayload,

        populateForm,

        updatePreparationState,

        submitForm
    };

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