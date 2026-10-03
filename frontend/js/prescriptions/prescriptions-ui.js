/* =========================================================
   MEDICORE — PRESCRIPTIONS UI
   Phase 11
   Table rendering, states, badges, actions and view modal.
   ========================================================= */

(function () {
    "use strict";

    const ui = {
        tableBody: document.getElementById("prescriptionsTableBody"),
        count: document.getElementById("prescriptionsCount"),
        loading: document.getElementById("prescriptionsLoading"),
        empty: document.getElementById("prescriptionsEmpty"),
        tableWrapper: document.getElementById("prescriptionsTableWrapper"),
        toastContainer: document.getElementById(
            "prescriptionToastContainer"
        ),

        totalCount: document.getElementById("prescriptionTotalCount"),
        activeCount: document.getElementById("prescriptionActiveCount"),
        todayCount: document.getElementById("prescriptionTodayCount"),
        refillCount: document.getElementById("prescriptionRefillCount")
    };

    const state = {
        prescriptions: []
    };

    /* =====================================================
       HELPERS
       ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getId(value) {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        return value._id || value.id || "";
    }

    function getName(value, fallback = "—") {
        if (!value) {
            return fallback;
        }

        if (typeof value === "string") {
            return value;
        }

        if (value.name) {
            return value.name;
        }

        const fullName = [
            value.firstName,
            value.lastName
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        return fullName || fallback;
    }

    function getInitials(name) {
        const cleanName = String(name || "Patient")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!cleanName.length) {
            return "P";
        }

        if (cleanName.length === 1) {
            return cleanName[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            cleanName[0][0] +
            cleanName[cleanName.length - 1][0]
        ).toUpperCase();
    }

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function normalizePrescription(prescription) {
        const patient =
            prescription.patient ||
            prescription.patientId ||
            null;

        const doctor =
            prescription.doctor ||
            prescription.doctorId ||
            null;

        const medicines =
            prescription.medicines ||
            prescription.medications ||
            [];

        return {
            ...prescription,
            id:
                prescription._id ||
                prescription.id ||
                "",
            patient,
            doctor,
            medicines: Array.isArray(medicines)
                ? medicines
                : []
        };
    }

    function getPatientName(prescription) {
        return getName(
            prescription.patient,
            prescription.patientName || "Unknown patient"
        );
    }

    function getDoctorName(prescription) {
        return getName(
            prescription.doctor,
            prescription.doctorName || "Unknown doctor"
        );
    }

    function getDiagnosis(prescription) {
        return (
            prescription.diagnosis ||
            prescription.condition ||
            "—"
        );
    }

    function getPrescriptionDate(prescription) {
        return (
            prescription.date ||
            prescription.prescriptionDate ||
            prescription.createdAt ||
            null
        );
    }

    function getInstructions(prescription) {
        return (
            prescription.instructions ||
            prescription.notes ||
            "No instructions provided."
        );
    }

    function getStatus(prescription) {
        if (prescription.status) {
            return String(
                prescription.status
            ).toLowerCase();
        }

        const dateValue = getPrescriptionDate(prescription);

        if (!dateValue) {
            return "active";
        }

        const date = new Date(dateValue);

        if (
            !Number.isNaN(date.getTime()) &&
            date < new Date()
        ) {
            return "completed";
        }

        return "active";
    }

    function getStatusLabel(status) {
        const labels = {
            active: "Active",
            completed: "Completed",
            expired: "Expired",
            pending: "Pending",
            cancelled: "Cancelled"
        };

        return (
            labels[status] ||
            String(status || "Active")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                )
        );
    }

    function getMedicineName(medicine) {
        return (
            medicine?.name ||
            medicine?.medicine ||
            medicine?.medicineName ||
            "Unnamed medicine"
        );
    }

    function getMedicineDosage(medicine) {
        return (
            medicine?.dosage ||
            medicine?.dose ||
            "—"
        );
    }

    function getMedicineFrequency(medicine) {
        return (
            medicine?.frequency ||
            medicine?.freq ||
            "—"
        );
    }

    function getMedicineDuration(medicine) {
        return (
            medicine?.duration ||
            "—"
        );
    }

    /* =====================================================
       LOADING / STATES
       ===================================================== */

    function showLoading() {
        if (ui.loading) {
            ui.loading.classList.remove("d-none");
        }

        if (ui.empty) {
            ui.empty.classList.add("d-none");
        }

        if (ui.tableWrapper) {
            ui.tableWrapper.classList.add("d-none");
        }
    }

    function showEmpty() {
        if (ui.loading) {
            ui.loading.classList.add("d-none");
        }

        if (ui.empty) {
            ui.empty.classList.remove("d-none");
        }

        if (ui.tableWrapper) {
            ui.tableWrapper.classList.add("d-none");
        }
    }

    function showTable() {
        if (ui.loading) {
            ui.loading.classList.add("d-none");
        }

        if (ui.empty) {
            ui.empty.classList.add("d-none");
        }

        if (ui.tableWrapper) {
            ui.tableWrapper.classList.remove("d-none");
        }
    }

    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary(prescriptions) {
        const list = Array.isArray(prescriptions)
            ? prescriptions
            : [];

        const active = list.filter(
            (prescription) =>
                getStatus(normalizePrescription(prescription)) ===
                "active"
        );

        const todayKey = new Date()
            .toISOString()
            .slice(0, 10);

        const today = list.filter((prescription) => {
            const normalized =
                normalizePrescription(prescription);

            const date = getPrescriptionDate(normalized);

            if (!date) {
                return false;
            }

            const dateObject = new Date(date);

            if (Number.isNaN(dateObject.getTime())) {
                return false;
            }

            return (
                dateObject.toISOString().slice(0, 10) ===
                todayKey
            );
        });

        const refills = list.filter((prescription) => {
            const normalized =
                normalizePrescription(prescription);

            return Number(
                normalized.refills || 0
            ) > 0;
        });

        if (ui.totalCount) {
            ui.totalCount.textContent = list.length;
        }

        if (ui.activeCount) {
            ui.activeCount.textContent = active.length;
        }

        if (ui.todayCount) {
            ui.todayCount.textContent = today.length;
        }

        if (ui.refillCount) {
            ui.refillCount.textContent = refills.length;
        }
    }

    /* =====================================================
       TABLE
       ===================================================== */

    function renderTable(prescriptions) {
        const list = Array.isArray(prescriptions)
            ? prescriptions.map(normalizePrescription)
            : [];

        state.prescriptions = list;

        updateSummary(list);

        if (ui.count) {
            ui.count.textContent = list.length;
        }

        if (!ui.tableBody) {
            return;
        }

        if (!list.length) {
            ui.tableBody.innerHTML = "";
            showEmpty();
            return;
        }

        ui.tableBody.innerHTML = list
            .map(renderRow)
            .join("");

        showTable();
    }

    function renderRow(prescription) {
        const id = getId(prescription);
        const patientName = getPatientName(prescription);
        const doctorName = getDoctorName(prescription);
        const diagnosis = getDiagnosis(prescription);
        const date = getPrescriptionDate(prescription);
        const status = getStatus(prescription);
        const medicines = prescription.medicines || [];

        const medicineCount = medicines.length;

        return `
            <tr data-prescription-id="${escapeHTML(id)}">
                <td>
                    <div class="prescription-patient">
                        <div class="prescription-avatar">
                            ${escapeHTML(getInitials(patientName))}
                        </div>

                        <div>
                            <div class="prescription-patient-name">
                                ${escapeHTML(patientName)}
                            </div>

                            <div class="prescription-patient-meta">
                                ${medicineCount}
                                ${medicineCount === 1 ? "medicine" : "medicines"}
                            </div>
                        </div>
                    </div>
                </td>

                <td>
                    <div class="prescription-doctor">
                        <div class="prescription-doctor-name">
                            ${escapeHTML(doctorName)}
                        </div>

                        <div class="prescription-doctor-meta">
                            Prescribing doctor
                        </div>
                    </div>
                </td>

                <td>
                    <div
                        class="prescription-diagnosis"
                        title="${escapeHTML(diagnosis)}"
                    >
                        <div class="prescription-diagnosis-text">
                            ${escapeHTML(diagnosis)}
                        </div>
                    </div>
                </td>

                <td>
                    <span class="prescription-status ${escapeHTML(status)}">
                        <i class="bi bi-circle-fill"></i>
                        ${escapeHTML(getStatusLabel(status))}
                    </span>
                </td>

                <td>
                    <div class="prescription-date">
                        ${escapeHTML(formatDate(date))}
                    </div>
                </td>

                <td>
                    <div class="prescription-actions">
                        <button
                            type="button"
                            class="prescription-action-btn view"
                            data-action="view"
                            data-id="${escapeHTML(id)}"
                            title="View prescription"
                            aria-label="View prescription"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="prescription-action-btn edit"
                            data-action="edit"
                            data-id="${escapeHTML(id)}"
                            title="Edit prescription"
                            aria-label="Edit prescription"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="prescription-action-btn delete"
                            data-action="delete"
                            data-id="${escapeHTML(id)}"
                            title="Delete prescription"
                            aria-label="Delete prescription"
                        >
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /* =====================================================
       VIEW MODAL
       ===================================================== */

    function renderViewModal(prescription) {
        const container =
            document.getElementById(
                "prescriptionDetails"
            );

        if (!container) {
            return;
        }

        const normalized =
            normalizePrescription(prescription);

        const patientName =
            getPatientName(normalized);

        const doctorName =
            getDoctorName(normalized);

        const diagnosis =
            getDiagnosis(normalized);

        const date =
            getPrescriptionDate(normalized);

        const medicines =
            normalized.medicines || [];

        const refills =
            normalized.refills ??
            0;

        const instructions =
            getInstructions(normalized);

        const status =
            getStatus(normalized);

        container.innerHTML = `
            <div class="prescription-detail-grid">

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Patient
                    </div>

                    <div class="prescription-detail-value">
                        ${escapeHTML(patientName)}
                    </div>
                </div>

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Doctor
                    </div>

                    <div class="prescription-detail-value">
                        ${escapeHTML(doctorName)}
                    </div>
                </div>

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Diagnosis
                    </div>

                    <div class="prescription-detail-value">
                        ${escapeHTML(diagnosis)}
                    </div>
                </div>

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Prescription Date
                    </div>

                    <div class="prescription-detail-value">
                        ${escapeHTML(formatDate(date))}
                    </div>
                </div>

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Status
                    </div>

                    <div class="prescription-detail-value">
                        <span class="prescription-status ${escapeHTML(status)}">
                            <i class="bi bi-circle-fill"></i>
                            ${escapeHTML(getStatusLabel(status))}
                        </span>
                    </div>
                </div>

                <div class="prescription-detail-item">
                    <div class="prescription-detail-label">
                        Refills
                    </div>

                    <div class="prescription-detail-value">
                        ${escapeHTML(refills)}
                    </div>
                </div>

            </div>

            <div class="prescription-detail-section">
                <h3>
                    <i class="bi bi-capsule me-1"></i>
                    Medicines
                </h3>

                ${renderMedicineDetails(medicines)}
            </div>

            <div class="prescription-detail-section">
                <h3>
                    <i class="bi bi-file-medical me-1"></i>
                    Instructions
                </h3>

                <p class="prescription-detail-text">
                    ${escapeHTML(instructions)}
                </p>
            </div>

            ${
                normalized.notes
                    ? `
                        <div class="prescription-detail-section">
                            <h3>
                                <i class="bi bi-journal-text me-1"></i>
                                Notes
                            </h3>

                            <p class="prescription-detail-text">
                                ${escapeHTML(normalized.notes)}
                            </p>
                        </div>
                    `
                    : ""
            }
        `;
    }

    function renderMedicineDetails(medicines) {
        if (!medicines.length) {
            return `
                <div class="prescription-detail-text">
                    No medicines recorded.
                </div>
            `;
        }

        return `
            <div class="prescription-view-medicines">
                <table>
                    <thead>
                        <tr>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${medicines
                            .map(
                                (medicine) => `
                                    <tr>
                                        <td>
                                            ${escapeHTML(
                                                getMedicineName(
                                                    medicine
                                                )
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                getMedicineDosage(
                                                    medicine
                                                )
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                getMedicineFrequency(
                                                    medicine
                                                )
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                getMedicineDuration(
                                                    medicine
                                                )
                                            )}
                                        </td>
                                    </tr>
                                `
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function openViewModal(prescription) {
        renderViewModal(prescription);

        const modalElement =
            document.getElementById(
                "viewPrescriptionModal"
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
       TOAST
       ===================================================== */

    function showToast(
        message,
        type = "success",
        title = ""
    ) {
        if (!ui.toastContainer) {
            return;
        }

        const titles = {
            success: title || "Success",
            error: title || "Something went wrong",
            warning: title || "Attention",
            info: title || "Information"
        };

        const icons = {
            success: "bi-check-circle-fill",
            error: "bi-exclamation-circle-fill",
            warning: "bi-exclamation-triangle-fill",
            info: "bi-info-circle-fill"
        };

        const toast = document.createElement("div");

        toast.className =
            `prescription-toast ${type}`;

        toast.innerHTML = `
            <div class="prescription-toast-icon">
                <i class="bi ${
                    icons[type] ||
                    icons.info
                }"></i>
            </div>

            <div class="prescription-toast-content">
                <p class="prescription-toast-title">
                    ${escapeHTML(titles[type] || "Information")}
                </p>

                <p class="prescription-toast-message">
                    ${escapeHTML(message)}
                </p>
            </div>

            <button
                type="button"
                class="btn-close btn-close-sm"
                aria-label="Close"
            ></button>
        `;

        ui.toastContainer.appendChild(toast);

        const closeButton =
            toast.querySelector(".btn-close");

        const removeToast = () => {
            toast.remove();
        };

        closeButton?.addEventListener(
            "click",
            removeToast
        );

        window.setTimeout(
            removeToast,
            4500
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.mediCorePrescriptionUI = {
        state,

        showLoading,
        showEmpty,
        showTable,

        renderTable,
        renderRow,

        renderViewModal,
        openViewModal,

        updateSummary,

        showToast,

        normalizePrescription,
        getPatientName,
        getDoctorName,
        getDiagnosis,
        getPrescriptionDate,
        getStatus,
        getStatusLabel,
        getMedicineName,
        getMedicineDosage,
        getMedicineFrequency,
        getMedicineDuration,

        formatDate,
        formatDateTime,
        escapeHTML
    };
})();