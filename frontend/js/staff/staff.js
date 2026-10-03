const staffPage = {

    async init() {
        staffUI.showLoading(true);

        try {
            await staffData.loadResources();

            staffUI.renderSummary();
            staffUI.renderRoleFilter();
            staffUI.renderDepartmentOptions();
            staffUI.renderTable();

            this.bindEvents();

        } catch (error) {
            console.error("Staff page initialization failed:", error);

            staffUI.showToast(
                error.response?.data?.message ||
                "Unable to load staff data.",
                "danger"
            );

            const wrapper =
                document.getElementById("staffTableWrapper");

            if (wrapper) {
                wrapper.hidden = true;
            }

        } finally {
            staffUI.showLoading(false);
        }
    },

    bindEvents() {

        document
            .getElementById("addStaffBtn")
            ?.addEventListener("click", () => {
                staffForm.openCreate();
            });

        document
            .getElementById("emptyCreateStaffBtn")
            ?.addEventListener("click", () => {
                staffForm.openCreate();
            });

        document
            .getElementById("refreshStaffBtn")
            ?.addEventListener("click", async () => {
                await this.refresh();
            });

        document
            .getElementById("clearStaffFilters")
            ?.addEventListener("click", async () => {

                staffData.clearFilters();

                document.getElementById("staffSearch").value = "";
                document.getElementById("staffRoleFilter").value = "";
                document.getElementById("staffDepartmentFilter").value = "";
                document.getElementById("staffStatusFilter").value = "";

                await this.refresh();
            });

        document
            .getElementById("staffSearch")
            ?.addEventListener("input", this.debounce(
                async (event) => {

                    staffData.setFilters({
                        search: event.target.value.trim()
                    });

                    await this.refresh();

                },
                350
            ));

        document
            .getElementById("staffRoleFilter")
            ?.addEventListener("change", async (event) => {

                staffData.setFilters({
                    role: event.target.value
                });

                await this.refresh();
            });

        document
            .getElementById("staffDepartmentFilter")
            ?.addEventListener("change", async (event) => {

                staffData.setFilters({
                    department: event.target.value
                });

                await this.refresh();
            });

        document
            .getElementById("staffStatusFilter")
            ?.addEventListener("change", async (event) => {

                staffData.setFilters({
                    status: event.target.value
                });

                await this.refresh();
            });

        document
            .getElementById("staffForm")
            ?.addEventListener("submit", (event) => {
                staffForm.submit(event);
            });

        document
            .getElementById("staffTableBody")
            ?.addEventListener("click", (event) => {

                const button =
                    event.target.closest("[data-action]");

                if (!button) {
                    return;
                }

                const action = button.dataset.action;
                const id = button.dataset.id;

                if (action === "view") {
                    staffForm.view(id);
                }

                if (action === "edit") {
                    staffForm.openEdit(id);
                }

                if (action === "delete") {
                    staffForm.delete(id);
                }
            });
    },

    async refresh() {
        try {
            staffUI.showLoading(true);

            await staffData.refresh();

            staffUI.renderSummary();
            staffUI.renderRoleFilter();
            staffUI.renderTable();

        } catch (error) {
            console.error("Unable to refresh staff:", error);

            staffUI.showToast(
                error.response?.data?.message ||
                "Unable to refresh staff.",
                "danger"
            );

        } finally {
            staffUI.showLoading(false);
        }
    },

    debounce(callback, delay) {
        let timeout;

        return (...args) => {
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }
};

window.staffPage = staffPage;

document.addEventListener("DOMContentLoaded", () => {
    staffPage.init();
});