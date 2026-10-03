function escapeDischargeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDischargePatientName(discharge) {
    const patient = discharge?.patient;

    if (!patient) {
        return "Unknown Patient";
    }

    return (
        [patient.firstName, patient.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        patient.patientId ||
        "Unknown Patient"
    );
}

function getDischargeDoctorName(discharge) {
    const doctor = discharge?.doctor;

    if (!doctor) {
        return "Not assigned";
    }

    return (
        [doctor.firstName, doctor.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        doctor.doctorId ||
        "Not assigned"
    );
}

function getDischargePatientId(discharge) {
    return discharge?.patient?.patientId || "—";
}

function getDischargeAdmissionNumber(discharge) {
    return discharge?.admission?.admissionNumber || "—";
}

function getDischargeInitials(discharge) {
    const patient = discharge?.patient;

    if (!patient) {
        return "PT";
    }

    const first = patient.firstName?.charAt(0) || "";
    const last = patient.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "PT";
}

function formatDischargeDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDischargeDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

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

function truncateDischargeText(value, length = 45) {
    if (!value) {
        return "—";
    }

    const text = String(value).trim();

    if (text.length <= length) {
        return text;
    }

    return `${text.slice(0, length).trim()}…`;
}

function renderDischargeSummary() {
    const summary = dischargesData.summary || {};

    const totalElement = document.getElementById("dischargesTotal");
    const todayElement = document.getElementById("dischargesToday");
    const monthElement = document.getElementById("dischargesMonth");

    if (totalElement) {
        totalElement.textContent = Number(summary.total || 0).toLocaleString();
    }

    if (todayElement) {
        todayElement.textContent = Number(summary.today || 0).toLocaleString();
    }

    if (monthElement) {
        monthElement.textContent = Number(
            summary.thisMonth || 0
        ).toLocaleString();
    }
}

function renderDischargeCount() {
    const countElement = document.getElementById("dischargeCount");

    if (!countElement) {
        return;
    }

    const count = dischargesData.discharges?.length || 0;

    countElement.textContent =
        `${count} ${count === 1 ? "record" : "records"}`;
}

function renderDischargesTable() {
    const tableBody = document.getElementById("dischargesTableBody");
    const tableWrapper = document.getElementById("dischargesTableWrapper");
    const emptyState = document.getElementById("dischargesEmpty");

    if (!tableBody) {
        return;
    }

    const discharges = dischargesData.discharges || [];

    tableBody.innerHTML = "";

    renderDischargeCount();

    if (!discharges.length) {
        if (tableWrapper) {
            tableWrapper.hidden = true;
        }

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    if (tableWrapper) {
        tableWrapper.hidden = false;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    discharges.forEach((discharge) => {
        const patientName = getDischargePatientName(discharge);
        const doctorName = getDischargeDoctorName(discharge);
        const patientId = getDischargePatientId(discharge);
        const admissionNumber = getDischargeAdmissionNumber(discharge);

        const diagnosis = truncateDischargeText(
            discharge.diagnosis,
            48
        );

        const condition = truncateDischargeText(
            discharge.condition,
            32
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar">
                        ${escapeDischargeHtml(
                            getDischargeInitials(discharge)
                        )}
                    </div>

                    <div>
                        <div class="patient-name">
                            ${escapeDischargeHtml(patientName)}
                        </div>

                        <div class="patient-id">
                            ${escapeDischargeHtml(patientId)}
                        </div>
                    </div>
                </div>
            </td>

            <td>
                <span class="admission-number">
                    ${escapeDischargeHtml(admissionNumber)}
                </span>
            </td>

            <td>
                <div class="doctor-cell">
                    <div class="doctor-name">
                        ${escapeDischargeHtml(doctorName)}
                    </div>
                </div>
            </td>

            <td>
                <span class="date-cell">
                    ${escapeDischargeHtml(
                        formatDischargeDate(discharge.admissionDate)
                    )}
                </span>
            </td>

            <td>
                <span class="date-cell">
                    ${escapeDischargeHtml(
                        formatDischargeDate(discharge.dischargeDate)
                    )}
                </span>
            </td>

            <td>
                <div class="diagnosis-cell" title="${escapeDischargeHtml(
                    discharge.diagnosis || ""
                )}">
                    ${escapeDischargeHtml(diagnosis)}
                </div>
            </td>

            <td>
                <span class="condition-badge" title="${escapeDischargeHtml(
                    discharge.condition || ""
                )}">
                    ${escapeDischargeHtml(condition)}
                </span>
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action-btn"
                        data-action="view"
                        data-id="${escapeDischargeHtml(discharge._id)}"
                        title="View"
                    >
                        <i class="bi bi-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-btn"
                        data-action="edit"
                        data-id="${escapeDischargeHtml(discharge._id)}"
                        title="Edit"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-btn danger"
                        data-action="delete"
                        data-id="${escapeDischargeHtml(discharge._id)}"
                        title="Delete"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function setDischargesLoading(isLoading) {
    const loadingElement = document.getElementById("dischargesLoading");
    const tableWrapper = document.getElementById(
        "dischargesTableWrapper"
    );
    const emptyElement = document.getElementById("dischargesEmpty");

    if (loadingElement) {
        loadingElement.hidden = !isLoading;
    }

    if (isLoading) {
        if (tableWrapper) {
            tableWrapper.hidden = true;
        }

        if (emptyElement) {
            emptyElement.hidden = true;
        }
    }
}

function populateDischargePatientOptions() {
    const formSelect = document.getElementById("dischargePatient");
    const filterSelect = document.getElementById(
        "dischargePatientFilter"
    );

    const patients = dischargesData.patients || [];

    if (formSelect) {
        const currentValue = formSelect.value;

        formSelect.innerHTML = `
            <option value="">Select patient</option>
        `;

        patients.forEach((patient) => {
            const name =
                [patient.firstName, patient.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                patient.patientId ||
                "Unknown Patient";

            const option = document.createElement("option");

            option.value = patient._id;
            option.textContent = `${name} — ${
                patient.patientId || "No ID"
            }`;

            formSelect.appendChild(option);
        });

        if (currentValue) {
            formSelect.value = currentValue;
        }
    }

    if (filterSelect) {
        const currentValue = filterSelect.value;

        filterSelect.innerHTML = `
            <option value="">All Patients</option>
        `;

        patients.forEach((patient) => {
            const name =
                [patient.firstName, patient.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                patient.patientId ||
                "Unknown Patient";

            const option = document.createElement("option");

            option.value = patient._id;
            option.textContent = `${name} — ${
                patient.patientId || "No ID"
            }`;

            filterSelect.appendChild(option);
        });

        if (currentValue) {
            filterSelect.value = currentValue;
        }
    }
}

function populateDischargeDoctorOptions() {
    const formSelect = document.getElementById("dischargeDoctor");
    const filterSelect = document.getElementById(
        "dischargeDoctorFilter"
    );

    const doctors = dischargesData.doctors || [];

    if (formSelect) {
        const currentValue = formSelect.value;

        formSelect.innerHTML = `
            <option value="">Select doctor</option>
        `;

        doctors.forEach((doctor) => {
            const name =
                [doctor.firstName, doctor.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                doctor.doctorId ||
                "Unknown Doctor";

            const specialization = doctor.specialization
                ? ` — ${doctor.specialization}`
                : "";

            const option = document.createElement("option");

            option.value = doctor._id;
            option.textContent = `${name}${specialization}`;

            formSelect.appendChild(option);
        });

        if (currentValue) {
            formSelect.value = currentValue;
        }
    }

    if (filterSelect) {
        const currentValue = filterSelect.value;

        filterSelect.innerHTML = `
            <option value="">All Doctors</option>
        `;

        doctors.forEach((doctor) => {
            const name =
                [doctor.firstName, doctor.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                doctor.doctorId ||
                "Unknown Doctor";

            const option = document.createElement("option");

            option.value = doctor._id;
            option.textContent = name;

            filterSelect.appendChild(option);
        });

        if (currentValue) {
            filterSelect.value = currentValue;
        }
    }
}

function populateDischargeAdmissionOptions(patientId = "") {
    const select = document.getElementById("dischargeAdmission");

    if (!select) {
        return;
    }

    const currentValue = select.value;

    let admissions = dischargesData.admissions || [];

    if (patientId) {
        admissions = admissions.filter(
            (admission) =>
                String(
                    admission.patient?._id ||
                    admission.patient
                ) === String(patientId)
        );
    }

    select.innerHTML = `
        <option value="">Select admission</option>
    `;

    admissions.forEach((admission) => {
        const option = document.createElement("option");

        option.value = admission._id;

        const number =
            admission.admissionNumber || "Admission";

        const date = admission.admissionDate
            ? formatDischargeDate(admission.admissionDate)
            : "No date";

        option.textContent = `${number} — ${date}`;

        option.dataset.patientId =
            admission.patient?._id ||
            admission.patient ||
            "";

        option.dataset.admissionDate =
            admission.admissionDate || "";

        option.dataset.doctorId =
            admission.attendingDoctor?._id ||
            admission.attendingDoctor ||
            "";

        select.appendChild(option);
    });

    if (
        currentValue &&
        Array.from(select.options).some(
            (option) => option.value === currentValue
        )
    ) {
        select.value = currentValue;
    }
}

function syncDischargeAdmissionFields() {
    const admissionSelect = document.getElementById(
        "dischargeAdmission"
    );

    const admissionDateInput = document.getElementById(
        "dischargeAdmissionDate"
    );

    const patientSelect = document.getElementById(
        "dischargePatient"
    );

    const doctorSelect = document.getElementById(
        "dischargeDoctor"
    );

    if (!admissionSelect) {
        return;
    }

    const selectedOption =
        admissionSelect.options[admissionSelect.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
        return;
    }

    const patientId = selectedOption.dataset.patientId;
    const admissionDate = selectedOption.dataset.admissionDate;
    const doctorId = selectedOption.dataset.doctorId;

    if (
        patientSelect &&
        patientId &&
        Array.from(patientSelect.options).some(
            (option) => option.value === patientId
        )
    ) {
        patientSelect.value = patientId;
    }

    if (admissionDateInput && admissionDate) {
        const date = new Date(admissionDate);

        if (!Number.isNaN(date.getTime())) {
            admissionDateInput.value =
                date.toISOString().split("T")[0];
        }
    }

    if (
        doctorSelect &&
        doctorId &&
        Array.from(doctorSelect.options).some(
            (option) => option.value === doctorId
        )
    ) {
        doctorSelect.value = doctorId;
    }
}

function showDischargeToast(message, type = "success") {
    const container = document.getElementById(
        "dischargesToastContainer"
    );

    if (!container) {
        return;
    }

    const iconMap = {
        success: "bi-check-circle-fill",
        danger: "bi-exclamation-circle-fill",
        warning: "bi-exclamation-triangle-fill",
        info: "bi-info-circle-fill"
    };

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${iconMap[type] || iconMap.info}"></i>
            <span>${escapeDischargeHtml(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    if (window.bootstrap?.Toast) {
        const instance = new bootstrap.Toast(toast, {
            delay: 3500
        });

        instance.show();

        toast.addEventListener("hidden.bs.toast", () => {
            toast.remove();
        });
    } else {
        toast.style.display = "block";

        setTimeout(() => {
            toast.remove();
        }, 3500);
    }
}

function showDischargeFormAlert(message) {
    const alertElement = document.getElementById(
        "dischargeFormAlert"
    );

    if (!alertElement) {
        return;
    }

    alertElement.textContent = message;
    alertElement.hidden = false;
}

function hideDischargeFormAlert() {
    const alertElement = document.getElementById(
        "dischargeFormAlert"
    );

    if (!alertElement) {
        return;
    }

    alertElement.textContent = "";
    alertElement.hidden = true;
}

function renderDischargeDetails(discharge) {
    const container = document.getElementById(
        "dischargeDetails"
    );

    if (!container || !discharge) {
        return;
    }

    const patientName = getDischargePatientName(discharge);
    const doctorName = getDischargeDoctorName(discharge);

    const patientId = getDischargePatientId(discharge);
    const admissionNumber =
        getDischargeAdmissionNumber(discharge);

    container.innerHTML = `
        <div class="discharge-detail-grid">

            <div class="discharge-detail-section">
                <h6>Patient Information</h6>

                <div class="detail-row">
                    <span class="detail-label">Patient</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(patientName)}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Patient ID</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(patientId)}
                    </span>
                </div>
            </div>

            <div class="discharge-detail-section">
                <h6>Admission</h6>

                <div class="detail-row">
                    <span class="detail-label">Admission</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(admissionNumber)}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Doctor</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(doctorName)}
                    </span>
                </div>
            </div>

            <div class="discharge-detail-section">
                <h6>Dates</h6>

                <div class="detail-row">
                    <span class="detail-label">Admission Date</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(
                            formatDischargeDate(
                                discharge.admissionDate
                            )
                        )}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Discharge Date</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(
                            formatDischargeDate(
                                discharge.dischargeDate
                            )
                        )}
                    </span>
                </div>
            </div>

            <div class="discharge-detail-section">
                <h6>Record</h6>

                <div class="detail-row">
                    <span class="detail-label">Created</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(
                            formatDischargeDateTime(
                                discharge.createdAt
                            )
                        )}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Updated</span>
                    <span class="detail-value">
                        ${escapeDischargeHtml(
                            formatDischargeDateTime(
                                discharge.updatedAt
                            )
                        )}
                    </span>
                </div>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Diagnosis</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.diagnosis || "No diagnosis recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Treatment</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.treatment || "No treatment recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Procedures</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.procedures || "No procedures recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Medication</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.medication || "No medication recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section">
                <h6>Condition</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.condition || "Not recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section">
                <h6>Follow-up</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.followUp || "No follow-up recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Instructions</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.instructions ||
                        "No instructions recorded."
                    )}
                </p>
            </div>

            <div class="discharge-detail-section full-width">
                <h6>Discharge Summary</h6>

                <p class="detail-text">
                    ${escapeDischargeHtml(
                        discharge.dischargeSummary ||
                        "No discharge summary recorded."
                    )}
                </p>
            </div>

        </div>
    `;
}

function openDischargeModal() {
    const modalElement =
        document.getElementById("dischargeModal");

    if (!modalElement || !window.bootstrap?.Modal) {
        return;
    }

    bootstrap.Modal.getOrCreateInstance(
        modalElement
    ).show();
}

function closeDischargeModal() {
    const modalElement =
        document.getElementById("dischargeModal");

    if (!modalElement || !window.bootstrap?.Modal) {
        return;
    }

    bootstrap.Modal.getOrCreateInstance(
        modalElement
    ).hide();
}

function openViewDischargeModal() {
    const modalElement = document.getElementById(
        "viewDischargeModal"
    );

    if (!modalElement || !window.bootstrap?.Modal) {
        return;
    }

    bootstrap.Modal.getOrCreateInstance(
        modalElement
    ).show();
}

function closeViewDischargeModal() {
    const modalElement = document.getElementById(
        "viewDischargeModal"
    );

    if (!modalElement || !window.bootstrap?.Modal) {
        return;
    }

    bootstrap.Modal.getOrCreateInstance(
        modalElement
    ).hide();
}

function setDischargeSaveLoading(isLoading) {
    const button = document.getElementById(
        "saveDischargeBtn"
    );

    const spinner = document.getElementById(
        "saveDischargeSpinner"
    );

    const icon = document.getElementById(
        "saveDischargeIcon"
    );

    const text = document.getElementById(
        "saveDischargeText"
    );

    if (button) {
        button.disabled = isLoading;
    }

    if (spinner) {
        spinner.hidden = !isLoading;
    }

    if (icon) {
        icon.hidden = isLoading;
    }

    if (text) {
        text.textContent = isLoading
            ? "Saving..."
            : dischargesData.editingId
                ? "Update Discharge"
                : "Save Discharge";
    }
}

window.escapeDischargeHtml = escapeDischargeHtml;
window.getDischargePatientName = getDischargePatientName;
window.getDischargeDoctorName = getDischargeDoctorName;
window.formatDischargeDate = formatDischargeDate;
window.renderDischargeSummary = renderDischargeSummary;
window.renderDischargeCount = renderDischargeCount;
window.renderDischargesTable = renderDischargesTable;
window.setDischargesLoading = setDischargesLoading;
window.populateDischargePatientOptions =
    populateDischargePatientOptions;
window.populateDischargeDoctorOptions =
    populateDischargeDoctorOptions;
window.populateDischargeAdmissionOptions =
    populateDischargeAdmissionOptions;
window.syncDischargeAdmissionFields =
    syncDischargeAdmissionFields;
window.showDischargeToast = showDischargeToast;
window.showDischargeFormAlert = showDischargeFormAlert;
window.hideDischargeFormAlert = hideDischargeFormAlert;
window.renderDischargeDetails = renderDischargeDetails;
window.openDischargeModal = openDischargeModal;
window.closeDischargeModal = closeDischargeModal;
window.openViewDischargeModal = openViewDischargeModal;
window.closeViewDischargeModal = closeViewDischargeModal;
window.setDischargeSaveLoading = setDischargeSaveLoading;