// =========================================================
// MEDICORE — MEDICAL RECORDS UI
// Phase 10
// =========================================================

/**
 * Format a date into a readable hospital-style date.
 */
function formatRecordDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/**
 * Format date and time for record details.
 */
function formatRecordDateTime(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/**
 * Get initials from a person's name.
 */
function getInitials(name = "") {
    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return "—";
    }

    if (words.length === 1) {
        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/**
 * Escape HTML to prevent unsafe content
 * from being inserted into the page.
 */
function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/**
 * Return patient's full name.
 */
function getPatientName(patient) {
    if (!patient) {
        return "Unknown Patient";
    }

    const firstName =
        patient.firstName || "";

    const lastName =
        patient.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return fullName || "Unknown Patient";
}


/**
 * Return doctor's display name.
 */
function getDoctorName(doctor) {
    if (!doctor) {
        return "Unknown Doctor";
    }

    if (doctor.name) {
        return doctor.name;
    }

    const firstName =
        doctor.firstName || "";

    const lastName =
        doctor.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    return fullName || "Unknown Doctor";
}


/**
 * Render loading state.
 */
function renderMedicalRecordsLoading(tbody) {
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="medical-records-state">
                <div class="state-content">
                    <div
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                    ></div>

                    <span>Loading medical records...</span>
                </div>
            </td>
        </tr>
    `;
}


/**
 * Render empty state.
 */
function renderMedicalRecordsEmpty(
    tbody,
    message = "No medical records found."
) {
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="medical-records-state">
                <div class="state-content">
                    <div class="empty-state-icon">
                        <i class="bi bi-file-medical"></i>
                    </div>

                    <strong>
                        No medical records
                    </strong>

                    <span>
                        ${escapeHtml(message)}
                    </span>
                </div>
            </td>
        </tr>
    `;
}


/**
 * Render error state.
 */
function renderMedicalRecordsError(
    tbody,
    message = "Unable to load medical records."
) {
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="medical-records-state">
                <div class="state-content">
                    <div class="empty-state-icon error-state">
                        <i class="bi bi-exclamation-triangle"></i>
                    </div>

                    <strong>
                        Something went wrong
                    </strong>

                    <span>
                        ${escapeHtml(message)}
                    </span>
                </div>
            </td>
        </tr>
    `;
}


/**
 * Build patient cell.
 */
function renderPatientCell(patient) {
    const name =
        getPatientName(patient);

    const patientId =
        patient?.patientId || "No ID";

    const initials =
        getInitials(name);

    return `
        <div class="record-person">
            <div class="record-avatar">
                ${escapeHtml(initials)}
            </div>

            <div class="record-person-info">
                <strong>
                    ${escapeHtml(name)}
                </strong>

                <span>
                    ${escapeHtml(patientId)}
                </span>
            </div>
        </div>
    `;
}


/**
 * Build doctor cell.
 */
function renderDoctorCell(doctor) {
    const name =
        getDoctorName(doctor);

    const specialization =
        doctor?.specialization ||
        "General";

    return `
        <div class="record-doctor">
            <strong>
                ${escapeHtml(name)}
            </strong>

            <span>
                ${escapeHtml(specialization)}
            </span>
        </div>
    `;
}


/**
 * Build clinical summary.
 */
function renderClinicalSummary(record) {
    const diagnosis =
        record?.diagnosis?.trim();

    const complaint =
        record?.chiefComplaint?.trim();

    if (diagnosis) {
        return `
            <div class="clinical-summary">
                <span class="clinical-label">
                    Diagnosis
                </span>

                <span
                    class="clinical-text"
                    title="${escapeHtml(diagnosis)}"
                >
                    ${escapeHtml(diagnosis)}
                </span>
            </div>
        `;
    }

    if (complaint) {
        return `
            <div class="clinical-summary">
                <span class="clinical-label">
                    Chief Complaint
                </span>

                <span
                    class="clinical-text"
                    title="${escapeHtml(complaint)}"
                >
                    ${escapeHtml(complaint)}
                </span>
            </div>
        `;
    }

    return `
        <span class="text-muted">
            No diagnosis recorded
        </span>
    `;
}


/**
 * Build actions cell.
 */
function renderRecordActions(recordId) {
    return `
        <div class="record-actions">

            <button
                type="button"
                class="btn btn-sm btn-light record-action-btn"
                data-action="view"
                data-id="${escapeHtml(recordId)}"
                title="View medical record"
                aria-label="View medical record"
            >
                <i class="bi bi-eye"></i>
            </button>

            <button
                type="button"
                class="btn btn-sm btn-light record-action-btn"
                data-action="edit"
                data-id="${escapeHtml(recordId)}"
                title="Edit medical record"
                aria-label="Edit medical record"
            >
                <i class="bi bi-pencil"></i>
            </button>

            <button
                type="button"
                class="btn btn-sm btn-light record-action-btn record-delete-btn"
                data-action="delete"
                data-id="${escapeHtml(recordId)}"
                title="Delete medical record"
                aria-label="Delete medical record"
            >
                <i class="bi bi-trash"></i>
            </button>

        </div>
    `;
}


/**
 * Render complete records table.
 */
function renderMedicalRecords(
    records = [],
    tbody
) {
    if (!tbody) {
        return;
    }

    if (!Array.isArray(records) || !records.length) {
        renderMedicalRecordsEmpty(tbody);
        return;
    }

    tbody.innerHTML = records
        .map((record) => {
            const patient =
                record.patient || {};

            const doctor =
                record.doctor || {};

            const recordId =
                record._id || "";

            return `
                <tr data-record-id="${escapeHtml(recordId)}">

                    <td>
                        <div class="record-date">
                            <strong>
                                ${escapeHtml(
                                    formatRecordDate(
                                        record.recordDate
                                    )
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    new Date(
                                        record.recordDate
                                    ).toLocaleTimeString(
                                        "en-GB",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }
                                    )
                                )}
                            </span>
                        </div>
                    </td>

                    <td>
                        ${renderPatientCell(patient)}
                    </td>

                    <td>
                        ${renderDoctorCell(doctor)}
                    </td>

                    <td>
                        ${renderClinicalSummary(record)}
                    </td>

                    <td>
                        <span class="record-status-badge">
                            <i class="bi bi-check-circle"></i>
                            Recorded
                        </span>
                    </td>

                    <td class="text-end">
                        ${renderRecordActions(recordId)}
                    </td>

                </tr>
            `;
        })
        .join("");
}


/**
 * Populate a patient select element.
 */
function populatePatientSelect(
    selectElement,
    patients = [],
    options = {}
) {
    if (!selectElement) {
        return;
    }

    const {
        placeholder = "Select patient",
        includeAll = false
    } = options;

    const currentValue =
        selectElement.value;

    let html = `
        <option value="">
            ${escapeHtml(
                includeAll
                    ? "All Patients"
                    : placeholder
            )}
        </option>
    `;

    if (Array.isArray(patients)) {
        html += patients
            .map((patient) => {
                const name =
                    getPatientName(patient);

                const patientId =
                    patient.patientId || "";

                return `
                    <option
                        value="${escapeHtml(patient._id)}"
                    >
                        ${escapeHtml(name)}
                        ${
                            patientId
                                ? ` — ${escapeHtml(patientId)}`
                                : ""
                        }
                    </option>
                `;
            })
            .join("");
    }

    selectElement.innerHTML = html;

    if (
        currentValue &&
        Array.from(
            selectElement.options
        ).some(
            (option) =>
                option.value === currentValue
        )
    ) {
        selectElement.value =
            currentValue;
    }
}


/**
 * Populate doctor select element.
 */
function populateDoctorSelect(
    selectElement,
    doctors = [],
    options = {}
) {
    if (!selectElement) {
        return;
    }

    const {
        placeholder = "Select doctor",
        includeAll = false
    } = options;

    const currentValue =
        selectElement.value;

    let html = `
        <option value="">
            ${escapeHtml(
                includeAll
                    ? "All Doctors"
                    : placeholder
            )}
        </option>
    `;

    if (Array.isArray(doctors)) {
        html += doctors
            .map((doctor) => {
                const name =
                    getDoctorName(doctor);

                const specialization =
                    doctor.specialization || "";

                return `
                    <option
                        value="${escapeHtml(doctor._id)}"
                    >
                        ${escapeHtml(name)}
                        ${
                            specialization
                                ? ` — ${escapeHtml(
                                    specialization
                                )}`
                                : ""
                        }
                    </option>
                `;
            })
            .join("");
    }

    selectElement.innerHTML = html;

    if (
        currentValue &&
        Array.from(
            selectElement.options
        ).some(
            (option) =>
                option.value === currentValue
        )
    ) {
        selectElement.value =
            currentValue;
    }
}


/**
 * Render a text section in the
 * medical record details modal.
 */
function renderDetailSection(
    label,
    value,
    icon = "bi-file-text"
) {
    const safeValue =
        value?.trim();

    return `
        <div class="record-detail-section">

            <div class="record-detail-label">
                <i class="bi ${icon}"></i>
                <span>
                    ${escapeHtml(label)}
                </span>
            </div>

            <div class="record-detail-value">
                ${
                    safeValue
                        ? escapeHtml(safeValue)
                        : '<span class="text-muted">Not recorded</span>'
                }
            </div>

        </div>
    `;
}


/**
 * Render view modal details.
 */
function renderMedicalRecordDetails(
    record,
    container
) {
    if (!container) {
        return;
    }

    if (!record) {
        container.innerHTML = `
            <div class="alert alert-warning mb-0">
                Medical record could not be found.
            </div>
        `;

        return;
    }

    const patient =
        record.patient || {};

    const doctor =
        record.doctor || {};

    const patientName =
        getPatientName(patient);

    const doctorName =
        getDoctorName(doctor);

    const patientId =
        patient.patientId || "—";

    const specialization =
        doctor.specialization || "—";

    container.innerHTML = `
        <div class="record-detail-header">

            <div class="record-detail-person">

                <div class="record-detail-avatar">
                    ${escapeHtml(
                        getInitials(patientName)
                    )}
                </div>

                <div>
                    <h5 class="mb-1">
                        ${escapeHtml(patientName)}
                    </h5>

                    <div class="record-detail-meta">
                        Patient ID:
                        ${escapeHtml(patientId)}
                    </div>
                </div>

            </div>

            <div class="record-detail-date">
                <span>
                    Record Date
                </span>

                <strong>
                    ${escapeHtml(
                        formatRecordDateTime(
                            record.recordDate
                        )
                    )}
                </strong>
            </div>

        </div>


        <div class="record-detail-clinicians">

            <div class="record-clinician">
                <span class="record-clinician-label">
                    Doctor
                </span>

                <strong>
                    ${escapeHtml(doctorName)}
                </strong>

                <small>
                    ${escapeHtml(
                        specialization
                    )}
                </small>
            </div>

            <div class="record-clinician">
                <span class="record-clinician-label">
                    Patient Status
                </span>

                <strong>
                    ${
                        patient.status
                            ? escapeHtml(
                                patient.status
                            )
                            : "Active"
                    }
                </strong>

                <small>
                    Medical Record
                </small>
            </div>

        </div>


        <div class="record-detail-content">

            ${renderDetailSection(
                "Chief Complaint",
                record.chiefComplaint,
                "bi-chat-left-text"
            )}

            ${renderDetailSection(
                "Symptoms",
                record.symptoms,
                "bi-activity"
            )}

            ${renderDetailSection(
                "Diagnosis",
                record.diagnosis,
                "bi-clipboard2-pulse"
            )}

            ${renderDetailSection(
                "Treatment Plan",
                record.treatmentPlan,
                "bi-prescription2"
            )}

            ${renderDetailSection(
                "Clinical Notes",
                record.notes,
                "bi-journal-medical"
            )}

        </div>
    `;
}


/**
 * Bind table action buttons.
 *
 * The actual actions are delegated to
 * callbacks supplied by medical-records.js.
 */
function bindMedicalRecordActions(
    tbody,
    callbacks = {}
) {
    if (!tbody) {
        return;
    }

    tbody.addEventListener(
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

            const recordId =
                button.dataset.id;

            if (!recordId) {
                return;
            }

            if (
                action === "view" &&
                typeof callbacks.onView ===
                    "function"
            ) {
                callbacks.onView(recordId);
            }

            if (
                action === "edit" &&
                typeof callbacks.onEdit ===
                    "function"
            ) {
                callbacks.onEdit(recordId);
            }

            if (
                action === "delete" &&
                typeof callbacks.onDelete ===
                    "function"
            ) {
                callbacks.onDelete(recordId);
            }
        }
    );
}


// =========================================================
// EXPORTS
// =========================================================

export {
    formatRecordDate,
    formatRecordDateTime,
    getInitials,
    escapeHtml,
    getPatientName,
    getDoctorName,
    renderMedicalRecordsLoading,
    renderMedicalRecordsEmpty,
    renderMedicalRecordsError,
    renderMedicalRecords,
    populatePatientSelect,
    populateDoctorSelect,
    renderMedicalRecordDetails,
    bindMedicalRecordActions
};