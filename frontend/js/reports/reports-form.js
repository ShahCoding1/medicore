const reportsForm = {
    reportTypes: {
        patient: [
            "Patient Demographics",
            "Patient Registration",
            "Patient Activity"
        ],

        clinical: [
            "Clinical Summary",
            "Diagnosis Report",
            "Medical Records"
        ],

        financial: [
            "Revenue Report",
            "Collections Report",
            "Outstanding Report"
        ],

        pharmacy: [
            "Inventory Report",
            "Medication Usage"
        ],

        laboratory: [
            "Laboratory Tests",
            "Laboratory Results"
        ],

        appointment: [
            "Appointment Summary",
            "No-show Report"
        ],

        doctor: [
            "Doctor Workload",
            "Doctor Activity"
        ],

        department: [
            "Department Workload",
            "Department Summary"
        ],

        operations: [
            "Bed Occupancy",
            "Operational Summary"
        ],

        audit: [
            "Audit Activity",
            "Security Activity"
        ]
    },

    columns: [
        "date",
        "patient",
        "doctor",
        "department",
        "status",
        "amount"
    ],

    init() {
        const category =
            document.getElementById(
                "reportCategory"
            );

        const type =
            document.getElementById(
                "reportType"
            );

        const columns =
            document.getElementById(
                "reportColumns"
            );

        if (!category || !type || !columns) {
            return;
        }

        const updateTypes = () => {
            const values =
                this.reportTypes[
                    category.value
                ] || [];

            type.innerHTML = `
                <option value="">
                    Select report type
                </option>

                ${values
                    .map(
                        (item) => `
                            <option value="${this.escape(
                                item
                            )}">
                                ${this.escape(item)}
                            </option>
                        `
                    )
                    .join("")}
            `;
        };

        category.addEventListener(
            "change",
            updateTypes
        );

        columns.innerHTML =
            this.columns
                .map(
                    (column) => `
                        <label class="column-option">

                            <input
                                type="checkbox"
                                value="${this.escape(column)}"
                                checked
                            >

                            <span>
                                ${this.escape(column)}
                            </span>

                        </label>
                    `
                )
                .join("");
    },

    escape(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    },

    getPayload() {
        const filtersText =
            document
                .getElementById("reportFilters")
                .value
                .trim();

        let filters = {};

        if (filtersText) {
            filters = JSON.parse(filtersText);
        }

        const columns = [
            ...document.querySelectorAll(
                "#reportColumns input:checked"
            )
        ].map(
            (input) => input.value
        );

        return {
            name:
                document
                    .getElementById("reportName")
                    .value
                    .trim(),

            category:
                document.getElementById(
                    "reportCategory"
                ).value,

            reportType:
                document.getElementById(
                    "reportType"
                ).value,

            dateRange: {
                from:
                    document.getElementById(
                        "reportFrom"
                    ).value,

                to:
                    document.getElementById(
                        "reportTo"
                    ).value
            },

            filters,

            columns,

            grouping:
                document.getElementById(
                    "reportGrouping"
                ).value,

            sort: {
                field:
                    document.getElementById(
                        "reportSortField"
                    ).value || "createdAt",

                direction:
                    document.getElementById(
                        "reportSortDirection"
                    ).value
            }
        };
    }
};