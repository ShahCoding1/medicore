/* =========================================================
   MEDICORE — LABORATORY MODULE CONTROLLER
   Phase 13 — Laboratory Tests
   ========================================================= */

(function () {
    "use strict";

    const laboratoryData =
        window.mediCoreLaboratoryData;

    const laboratoryUI =
        window.mediCoreLaboratoryUI;

    if (!laboratoryData) {
        console.error(
            "MediCore Laboratory Data layer is not available."
        );
        return;
    }

    if (!laboratoryUI) {
        console.error(
            "MediCore Laboratory UI layer is not available."
        );
        return;
    }

    const state = {
        initialized: false,
        loading: false
    };

    const elements = {
        refreshButton: document.getElementById(
            "refreshLabTestsBtn"
        ),

        addButton: document.getElementById(
            "addLabTestBtn"
        ),

        emptyAddButton: document.getElementById(
            "emptyAddLabTestBtn"
        ),

        activeButton: document.getElementById(
            "activeLabTestsBtn"
        ),

        inactiveButton: document.getElementById(
            "inactiveLabTestsBtn"
        ),

        form: document.getElementById(
            "labTestForm"
        ),

        modal: document.getElementById(
            "labTestModal"
        ),

        modalLabel: document.getElementById(
            "labTestModalLabel"
        ),

        saveButton: document.getElementById(
            "saveLabTestBtn"
        ),

        viewModal: document.getElementById(
            "viewLabTestModal"
        )
    };

    function getBootstrapModal(element) {
        if (
            !element ||
            !window.bootstrap ||
            !window.bootstrap.Modal
        ) {
            return null;
        }

        return window.bootstrap.Modal.getOrCreateInstance(
            element
        );
    }

    function openFormModal(mode = "create") {
        const modal =
            getBootstrapModal(
                elements.modal
            );

        if (!modal) {
            console.warn(
                "Laboratory form modal is not available."
            );
            return;
        }

        if (mode === "create") {
            laboratoryUI.selectTest(null);

            document.dispatchEvent(
                new CustomEvent(
                    "medicore:laboratory:create"
                )
            );
        }

        modal.show();
    }

    function closeFormModal() {
        const modal =
            getBootstrapModal(
                elements.modal
            );

        if (modal) {
            modal.hide();
        }
    }

    async function refreshTests(
        options = {}
    ) {
        if (state.loading) {
            return;
        }

        state.loading = true;

        try {
            await laboratoryUI.loadTests(
                options
            );
        } catch (error) {
            console.error(
                "Laboratory refresh failed:",
                error
            );
        } finally {
            state.loading = false;
        }
    }

    function handleCreateRequest() {
        openFormModal("create");
    }

    function handleRefreshRequest() {
        refreshTests();
    }

    function handleEditRequest(event) {
        const test =
            event.detail?.test;

        if (!test) {
            return;
        }

        const modal =
            getBootstrapModal(
                elements.modal
            );

        if (!modal) {
            return;
        }

        document.dispatchEvent(
            new CustomEvent(
                "medicore:laboratory:form-edit",
                {
                    detail: {
                        test
                    }
                }
            )
        );

        modal.show();
    }

    async function handleDeleteRequest(
        event
    ) {
        const test =
            event.detail?.test;

        if (!test || !test.id) {
            return;
        }

        const testName =
            test.testName ||
            "this laboratory test";

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${testName}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            await laboratoryData.deleteLabTest(
                test.id
            );

            laboratoryUI.removeTest(
                test.id
            );

            laboratoryUI.showToast(
                "Laboratory test deleted successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Failed to delete laboratory test:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Unable to delete laboratory test.";

            laboratoryUI.showToast(
                message,
                "danger"
            );
        }
    }

    function handleFormSaved(event) {
        const test =
            event.detail?.test;

        if (test) {
            laboratoryUI.addTest(
                test
            );
        }

        closeFormModal();

        refreshTests();
    }

    function handleCreateEvent() {
        if (
            !elements.form ||
            !window.mediCoreLaboratoryForm
        ) {
            return;
        }

        if (
            typeof window
                .mediCoreLaboratoryForm
                .resetForm ===
            "function"
        ) {
            window.mediCoreLaboratoryForm.resetForm();
        }
    }

    function bindEvents() {
        if (elements.refreshButton) {
            elements.refreshButton.addEventListener(
                "click",
                handleRefreshRequest
            );
        }

        if (elements.addButton) {
            elements.addButton.addEventListener(
                "click",
                handleCreateRequest
            );
        }

        if (elements.emptyAddButton) {
            elements.emptyAddButton.addEventListener(
                "click",
                handleCreateRequest
            );
        }

        document.addEventListener(
            "medicore:laboratory:edit",
            handleEditRequest
        );

        document.addEventListener(
            "medicore:laboratory:delete",
            handleDeleteRequest
        );

        document.addEventListener(
            "medicore:laboratory:saved",
            handleFormSaved
        );

        document.addEventListener(
            "medicore:laboratory:create",
            handleCreateEvent
        );
    }

    function initializeModal() {
        if (!elements.modal) {
            return;
        }

        elements.modal.addEventListener(
            "hidden.bs.modal",
            () => {
                document.dispatchEvent(
                    new CustomEvent(
                        "medicore:laboratory:modal-closed"
                    )
                );
            }
        );
    }

    async function init() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        bindEvents();
        initializeModal();

        await refreshTests();
    }

    window.mediCoreLaboratory = {
        state,

        init,

        refresh: refreshTests,

        openForm: openFormModal,

        closeForm: closeFormModal,

        getState() {
            return {
                initialized:
                    state.initialized,

                loading:
                    state.loading,

                tests:
                    laboratoryUI.state.tests,

                filteredTests:
                    laboratoryUI.state
                        .filteredTests
            };
        }
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