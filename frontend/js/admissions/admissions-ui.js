const admissionsUIState = {
    admissions: [],
    filteredAdmissions: []
};

const admissionsUIElements = {};

const cacheAdmissionElements = () => {
    admissionsUIElements.total =
        document.getElementById("admissionsTotal");

    admissionsUIElements.active =
        document.getElementById("admissionsActive");

    admissionsUIElements.emergency =
        document.getElementById("admissionsEmergency");

    admissionsUIElements.critical =
        document.getElementById("admissionsCritical");

    admissionsUIElements.count =
        document.getElementById("admissionCount");

    admissionsUIElements.loading =
        document.getElementById("admissionsLoading");

    admissionsUIElements.empty =
        document.getElementById("admissionsEmpty");

    admissionsUIElements.tableWrapper =
        document.getElementById(
            "admissionsTableWrapper"
        );

    admissionsUIElements.tableBody =
        document.getElementById(
            "admissionsTableBody"
        );

    admissionsUIElements.details =
        document.getElementById(
            "admissionDetails"
        );

    admissionsUIElements.viewSubtitle =
        document.getElementById(
            "viewAdmissionSubtitle"
        );
};

const renderSummary = (summary = {}) => {
    if (admissionsUIElements.total) {
        admissionsUIElements.total.textContent =
            summary.total || 0;
    }

    if (admissionsUIElements.active) {
        admissionsUIElements.active.textContent =
            Number(summary.admitted || 0) +
            Number(summary.observation || 0);
    }

    if (admissionsUIElements.emergency) {
        admissionsUIElements.emergency.textContent =
            summary.emergency || 0;
    }

    if (admissionsUIElements.critical) {
        admissionsUIElements.critical.textContent =
            summary.critical || 0;
    }
};

const getStatusClass = (status) => {
    return `status-${status || "admitted"}`;
};

const getPriorityClass = (priority) => {
    return `priority-${priority || "normal"}`;
};

const getTypeClass = (type) => {
    return `type-${type || "routine"}`;
};

const renderAdmissions = (admissions = []) => {
    admissionsUIState.admissions =
        admissions.map(
            window.mediCoreAdmissionsData
                .normalizeAdmission
        );

    admissionsUIState.filteredAdmissions =
        [...admissionsUIState.admissions];

    if (admissionsUIElements.count) {
        admissionsUIElements.count.textContent =
            admissionsUIState.filteredAdmissions.length;
    }

    if (!admissionsUIElements.tableBody) {
        return;
    }

    if (
        admissionsUIState.filteredAdmissions.length ===
        0
    ) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    admissionsUIElements.tableBody.innerHTML =
        admissionsUIState.filteredAdmissions
            .map(renderAdmissionRow)
            .join("");
};

const renderAdmissionRow = (admission) => {
    const data =
        window.mediCoreAdmissionsData;

    const patientName =
        data.getPatientName(
            admission.patient
        );

    const patientId =
        admission.patient?.patientId || "";

    const doctorName =
        data.getDoctorName(
            admission.attendingDoctor
        );

    const department =
        admission.department?.name || "—";

    const room =
        admission.roomNumber || "—";

    const bed =
        admission.bedNumber || "—";

    return `
        <tr>
            <td>
                <div class="admission-number">
                    ${data.escapeHtml(
                        admission.admissionNumber ||
                        "—"
                    )}
                </div>
            </td>

            <td>
                <div class="patient-name">
                    ${data.escapeHtml(
                        patientName
                    )}
                </div>

                ${
                    patientId
                        ? `
                            <div class="patient-id">
                                ${data.escapeHtml(
                                    patientId
                                )}
                            </div>
                        `
                        : ""
                }
            </td>

            <td>
                ${data.escapeHtml(
                    doctorName
                )}
            </td>

            <td>
                ${data.escapeHtml(
                    department
                )}
            </td>

            <td>
                ${data.escapeHtml(
                    data.formatDateTime(
                        admission.admissionDate
                    )
                )}
            </td>

            <td>
                <span class="type-badge ${getTypeClass(
                    admission.admissionType
                )}">
                    ${data.escapeHtml(
                        data.getAdmissionTypeLabel(
                            admission.admissionType
                        )
                    )}
                </span>
            </td>

            <td>
                <span class="priority-badge ${getPriorityClass(
                    admission.priority
                )}">
                    ${data.escapeHtml(
                        data.getPriorityLabel(
                            admission.priority
                        )
                    )}
                </span>
            </td>

            <td>
                <span class="status-badge ${getStatusClass(
                    admission.status
                )}">
                    ${data.escapeHtml(
                        data.getStatusLabel(
                            admission.status
                        )
                    )}
                </span>
            </td>

            <td>
                <div class="room-bed">
                    ${data.escapeHtml(room)}

                    <small>
                        Bed:
                        ${data.escapeHtml(bed)}
                    </small>
                </div>
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        type="button"
                        class="btn btn-light border"
                        title="View"
                        data-action="view"
                        data-id="${admission._id}"
                    >
                        <i class="bi bi-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-light border"
                        title="Edit"
                        data-action="edit"
                        data-id="${admission._id}"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-light border text-danger"
                        title="Delete"
                        data-action="delete"
                        data-id="${admission._id}"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>

                </div>
            </td>
        </tr>
    `;
};

const showLoadingState = () => {
    admissionsUIElements.loading
        ?.classList.remove("d-none");

    admissionsUIElements.empty
        ?.classList.add("d-none");

    admissionsUIElements.tableWrapper
        ?.classList.add("d-none");
};

const hideLoadingState = () => {
    admissionsUIElements.loading
        ?.classList.add("d-none");
};

const showEmptyState = () => {
    hideLoadingState();

    admissionsUIElements.empty
        ?.classList.remove("d-none");

    admissionsUIElements.tableWrapper
        ?.classList.add("d-none");

    if (admissionsUIElements.count) {
        admissionsUIElements.count.textContent =
            "0";
    }
};

const hideEmptyState = () => {
    hideLoadingState();

    admissionsUIElements.empty
        ?.classList.add("d-none");

    admissionsUIElements.tableWrapper
        ?.classList.remove("d-none");
};

const findAdmission = (id) => {
    return admissionsUIState.admissions.find(
        (item) => item._id === id
    );
};

const filterAdmissions = ({
    search = "",
    status = "",
    type = "",
    priority = "",
    dateFrom = "",
    dateTo = ""
} = {}) => {
    const normalizedSearch =
        String(search)
            .trim()
            .toLowerCase();

    admissionsUIState.filteredAdmissions =
        admissionsUIState.admissions.filter(
            (admission) => {
                const patientName =
                    window
                        .mediCoreAdmissionsData
                        .getPatientName(
                            admission.patient
                        )
                        .toLowerCase();

                const doctorName =
                    window
                        .mediCoreAdmissionsData
                        .getDoctorName(
                            admission.attendingDoctor
                        )
                        .toLowerCase();

                const searchable = [
                    admission.admissionNumber,
                    admission.reason,
                    admission.diagnosis,
                    admission.roomNumber,
                    admission.bedNumber,
                    admission.ward,
                    admission.patient?.patientId,
                    patientName,
                    doctorName
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (
                    normalizedSearch &&
                    !searchable.includes(
                        normalizedSearch
                    )
                ) {
                    return false;
                }

                if (
                    status &&
                    admission.status !== status
                ) {
                    return false;
                }

                if (
                    type &&
                    admission.admissionType !== type
                ) {
                    return false;
                }

                if (
                    priority &&
                    admission.priority !== priority
                ) {
                    return false;
                }

                const admissionDate =
                    admission.admissionDate
                        ? new Date(
                              admission.admissionDate
                          )
                        : null;

                if (
                    dateFrom &&
                    admissionDate &&
                    admissionDate <
                        new Date(
                            `${dateFrom}T00:00:00`
                        )
                ) {
                    return false;
                }

                if (
                    dateTo &&
                    admissionDate &&
                    admissionDate >
                        new Date(
                            `${dateTo}T23:59:59`
                        )
                ) {
                    return false;
                }

                return true;
            }
        );

    if (admissionsUIElements.count) {
        admissionsUIElements.count.textContent =
            admissionsUIState
                .filteredAdmissions
                .length;
    }

    if (
        admissionsUIState
            .filteredAdmissions
            .length === 0
    ) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    admissionsUIElements.tableBody.innerHTML =
        admissionsUIState.filteredAdmissions
            .map(renderAdmissionRow)
            .join("");
};

const renderAdmissionDetails = (admission) => {
    if (!admission) {
        admissionsUIElements.details.innerHTML =
            `
                <div class="alert alert-warning">
                    Admission details are unavailable.
                </div>
            `;

        return;
    }

    const data =
        window.mediCoreAdmissionsData;

    const patientName =
        data.getPatientName(
            admission.patient
        );

    const doctorName =
        data.getDoctorName(
            admission.attendingDoctor
        );

    const department =
        admission.department?.name || "—";

    if (admissionsUIElements.viewSubtitle) {
        admissionsUIElements.viewSubtitle.textContent =
            admission.admissionNumber || "";
    }

    admissionsUIElements.details.innerHTML = `
        <div class="admission-detail-grid">

            ${detail(
                "Admission Number",
                admission.admissionNumber
            )}

            ${detail(
                "Patient",
                patientName
            )}

            ${detail(
                "Patient ID",
                admission.patient?.patientId
            )}

            ${detail(
                "Attending Doctor",
                doctorName
            )}

            ${detail(
                "Department",
                department
            )}

            ${detail(
                "Admission Date",
                data.formatDateTime(
                    admission.admissionDate
                )
            )}

            ${detail(
                "Expected Discharge",
                data.formatDateTime(
                    admission.expectedDischargeDate
                )
            )}

            ${detail(
                "Actual Discharge",
                data.formatDateTime(
                    admission.actualDischargeDate
                )
            )}

            ${detail(
                "Admission Type",
                data.getAdmissionTypeLabel(
                    admission.admissionType
                )
            )}

            ${detail(
                "Priority",
                data.getPriorityLabel(
                    admission.priority
                )
            )}

            ${detail(
                "Status",
                data.getStatusLabel(
                    admission.status
                )
            )}

            ${detail(
                "Ward",
                admission.ward
            )}

            ${detail(
                "Room Number",
                admission.roomNumber
            )}

            ${detail(
                "Bed Number",
                admission.bedNumber
            )}

        </div>

        <div class="admission-detail-section">
            <h6>Reason</h6>

            <div class="admission-detail-text">
                ${data.escapeHtml(
                    admission.reason ||
                    "No reason provided."
                )}
            </div>
        </div>

        <div class="admission-detail-section">
            <h6>Diagnosis</h6>

            <div class="admission-detail-text">
                ${data.escapeHtml(
                    admission.diagnosis ||
                    "No diagnosis provided."
                )}
            </div>
        </div>

        <div class="admission-detail-section">
            <h6>Symptoms</h6>

            <div class="admission-detail-text">
                ${data.escapeHtml(
                    admission.symptoms ||
                    "No symptoms recorded."
                )}
            </div>
        </div>

        <div class="admission-detail-section">
            <h6>Notes</h6>

            <div class="admission-detail-text">
                ${data.escapeHtml(
                    admission.notes ||
                    "No additional notes."
                )}
            </div>
        </div>

        ${
            admission.dischargeSummary
                ? `
                    <div class="admission-detail-section">
                        <h6>Discharge Summary</h6>

                        <div class="admission-detail-text">
                            ${data.escapeHtml(
                                admission.dischargeSummary
                            )}
                        </div>
                    </div>
                `
                : ""
        }
    `;
};

const detail = (label, value) => {
    const data =
        window.mediCoreAdmissionsData;

    return `
        <div class="detail-item">
            <div class="detail-label">
                ${data.escapeHtml(label)}
            </div>

            <div class="detail-value">
                ${data.escapeHtml(
                    value || "—"
                )}
            </div>
        </div>
    `;
};

const showToast = (
    message,
    type = "success"
) => {
    const container =
        document.getElementById(
            "admissionsToastContainer"
        );

    if (!container) return;

    const icon =
        type === "success"
            ? "check-circle"
            : type === "danger"
                ? "exclamation-circle"
                : "info-circle";

    const toast = document.createElement(
        "div"
    );

    toast.className =
        "toast align-items-center show";

    toast.innerHTML = `
        <div class="d-flex">

            <div class="toast-body">
                <i class="bi bi-${icon} me-2"></i>
                ${window.mediCoreAdmissionsData
                    .escapeHtml(message)}
            </div>

            <button
                type="button"
                class="btn-close me-2 m-auto"
                data-bs-dismiss="toast"
            ></button>

        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
};

const openViewModal = (admission) => {
    renderAdmissionDetails(admission);

    const modalElement =
        document.getElementById(
            "viewAdmissionModal"
        );

    if (!modalElement) return;

    bootstrap.Modal
        .getOrCreateInstance(
            modalElement
        )
        .show();
};

window.mediCoreAdmissionsUI = {
    state: admissionsUIState,
    elements: admissionsUIElements,
    cacheElements: cacheAdmissionElements,
    renderSummary,
    renderAdmissions,
    renderAdmissionDetails,
    showLoadingState,
    hideLoadingState,
    showEmptyState,
    hideEmptyState,
    findAdmission,
    filterAdmissions,
    openViewModal,
    showToast,
    getStatusClass,
    getPriorityClass,
    getTypeClass
};