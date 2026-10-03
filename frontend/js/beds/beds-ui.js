function escapeBedHtml(value) {
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


function formatBedType(type) {
    const labels = {
        general: "General",
        semi_private: "Semi Private",
        private: "Private",
        icu: "ICU",
        emergency: "Emergency",
        isolation: "Isolation"
    };

    return labels[type] || type || "—";
}


function formatBedStatus(status) {
    const labels = {
        available: "Available",
        occupied: "Occupied",
        reserved: "Reserved",
        maintenance: "Maintenance",
        blocked: "Blocked"
    };

    return labels[status] || status || "Unknown";
}


function getBedStatusClass(status) {
    return `status-${status || "unknown"}`;
}


function getPatientName(patient) {
    if (!patient) {
        return "Unassigned";
    }

    if (typeof patient === "string") {
        return patient;
    }

    const name = [
        patient.firstName,
        patient.middleName,
        patient.lastName
    ]
        .filter(Boolean)
        .join(" ");

    return name || patient.patientId || "Assigned Patient";
}


function getPatientIdentifier(patient) {
    if (!patient || typeof patient === "string") {
        return "";
    }

    return patient.patientId || "";
}


function renderBedSummary() {
    const summary = bedsData.summary || {};

    const values = {
        bedsTotal: summary.total || 0,
        bedsAvailable: summary.available || 0,
        bedsOccupied: summary.occupied || 0,
        bedsMaintenance: summary.maintenance || 0,
        bedsBlocked: summary.blocked || 0
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });
}


function renderBedTable() {
    const tbody = document.getElementById(
        "bedsTableBody"
    );

    const wrapper = document.getElementById(
        "bedsTableWrapper"
    );

    const emptyState = document.getElementById(
        "bedsEmpty"
    );

    const count = document.getElementById(
        "bedCount"
    );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    const beds = bedsData.beds || [];

    if (count) {
        count.textContent = beds.length;
    }

    if (!beds.length) {
        if (wrapper) {
            wrapper.style.display = "none";
        }

        if (emptyState) {
            emptyState.style.display = "flex";
        }

        return;
    }

    if (wrapper) {
        wrapper.style.display = "";
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }

    beds.forEach((bed) => {
        const patientName = getPatientName(
            bed.patient
        );

        const patientId = getPatientIdentifier(
            bed.patient
        );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="bed-number-cell">
                    <div class="bed-number-icon">
                        <i class="bi bi-grid-3x3-gap"></i>
                    </div>

                    <div>
                        <strong>
                            ${escapeBedHtml(bed.bedNumber)}
                        </strong>

                        <small>
                            ${escapeBedHtml(
                                bed._id || ""
                            ).slice(0, 8)}
                        </small>
                    </div>
                </div>
            </td>

            <td>
                <span class="table-primary-text">
                    ${escapeBedHtml(bed.ward || "—")}
                </span>
            </td>

            <td>
                ${escapeBedHtml(bed.roomNumber || "—")}
            </td>

            <td>
                <span class="bed-type-badge">
                    ${escapeBedHtml(
                        formatBedType(bed.bedType)
                    )}
                </span>
            </td>

            <td>
                <div class="patient-cell">

                    <div class="patient-avatar">
                        ${
                            bed.patient
                                ? escapeBedHtml(
                                      patientName
                                          .split(" ")
                                          .map(
                                              (part) =>
                                                  part[0] || ""
                                          )
                                          .slice(0, 2)
                                          .join("")
                                          .toUpperCase()
                                  )
                                : "—"
                        }
                    </div>

                    <div>
                        <strong>
                            ${escapeBedHtml(patientName)}
                        </strong>

                        ${
                            patientId
                                ? `<small>${escapeBedHtml(
                                      patientId
                                  )}</small>`
                                : ""
                        }
                    </div>

                </div>
            </td>

            <td>
                <span
                    class="bed-status ${getBedStatusClass(
                        bed.status
                    )}"
                >
                    <span class="status-dot"></span>
                    ${escapeBedHtml(
                        formatBedStatus(bed.status)
                    )}
                </span>
            </td>

            <td>
                ${escapeBedHtml(bed.floor || "—")}
            </td>

            <td>
                <div class="table-actions">

                    ${
                        bed.status === "available" ||
                        bed.status === "reserved"
                            ? `
                        <button
                            type="button"
                            class="table-action-btn assign"
                            title="Assign bed"
                            data-action="assign"
                            data-id="${escapeBedHtml(
                                bed._id
                            )}"
                        >
                            <i class="bi bi-person-plus"></i>
                        </button>
                        `
                            : ""
                    }

                    ${
                        bed.status === "occupied"
                            ? `
                        <button
                            type="button"
                            class="table-action-btn release"
                            title="Release bed"
                            data-action="release"
                            data-id="${escapeBedHtml(
                                bed._id
                            )}"
                        >
                            <i class="bi bi-person-dash"></i>
                        </button>
                        `
                            : ""
                    }

                    <button
                        type="button"
                        class="table-action-btn"
                        title="View bed"
                        data-action="view"
                        data-id="${escapeBedHtml(
                            bed._id
                        )}"
                    >
                        <i class="bi bi-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-btn"
                        title="Edit bed"
                        data-action="edit"
                        data-id="${escapeBedHtml(
                            bed._id
                        )}"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="table-action-btn danger"
                        title="Delete bed"
                        data-action="delete"
                        data-id="${escapeBedHtml(
                            bed._id
                        )}"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}


function setBedsLoading(isLoading) {
    const loading = document.getElementById(
        "bedsLoading"
    );

    const wrapper = document.getElementById(
        "bedsTableWrapper"
    );

    if (loading) {
        loading.style.display = isLoading
            ? "flex"
            : "none";
    }

    if (isLoading && wrapper) {
        wrapper.style.display = "none";
    }
}


function showBedToast(message, type = "success") {
    const container = document.getElementById(
        "bedsToastContainer"
    );

    if (!container) {
        return;
    }

    const icons = {
        success: "bi-check-circle-fill",
        danger: "bi-exclamation-circle-fill",
        warning: "bi-exclamation-triangle-fill",
        info: "bi-info-circle-fill"
    };

    const toast = document.createElement("div");

    toast.className =
        `toast beds-toast align-items-center text-bg-${type} border-0`;

    toast.setAttribute("role", "alert");

    toast.innerHTML = `
        <div class="d-flex">

            <div class="toast-body">
                <i class="bi ${
                    icons[type] || icons.info
                }"></i>

                <span>
                    ${escapeBedHtml(message)}
                </span>
            </div>

            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
            ></button>

        </div>
    `;

    container.appendChild(toast);

    const bootstrapToast =
        new bootstrap.Toast(toast, {
            delay: 3500
        });

    bootstrapToast.show();

    toast.addEventListener(
        "hidden.bs.toast",
        () => toast.remove()
    );
}


function showBedFormAlert(message, type = "danger") {
    const alert = document.getElementById(
        "bedFormAlert"
    );

    if (!alert) {
        return;
    }

    alert.className =
        `alert alert-${type}`;

    alert.textContent = message;
    alert.classList.remove("d-none");
}


function hideBedFormAlert() {
    const alert = document.getElementById(
        "bedFormAlert"
    );

    if (!alert) {
        return;
    }

    alert.classList.add("d-none");
}


function showAssignAlert(message, type = "danger") {
    const alert = document.getElementById(
        "assignBedAlert"
    );

    if (!alert) {
        return;
    }

    alert.className =
        `alert alert-${type}`;

    alert.textContent = message;
    alert.classList.remove("d-none");
}


function hideAssignAlert() {
    const alert = document.getElementById(
        "assignBedAlert"
    );

    if (!alert) {
        return;
    }

    alert.classList.add("d-none");
}


function renderPatientOptions(
    selectId,
    includeEmpty = true
) {
    const select = document.getElementById(
        selectId
    );

    if (!select) {
        return;
    }

    select.innerHTML = includeEmpty
        ? `<option value="">No patient assigned</option>`
        : `<option value="">Select patient</option>`;

    bedsData.patients.forEach((patient) => {
        const option = document.createElement(
            "option"
        );

        option.value = patient._id;

        const name = getPatientName(patient);

        const identifier =
            patient.patientId
                ? ` (${patient.patientId})`
                : "";

        option.textContent =
            `${name}${identifier}`;

        select.appendChild(option);
    });
}


function renderAdmissionOptions(
    selectId,
    includeEmpty = true
) {
    const select = document.getElementById(
        selectId
    );

    if (!select) {
        return;
    }

    select.innerHTML = includeEmpty
        ? `<option value="">No admission assigned</option>`
        : `<option value="">Select admission</option>`;

    bedsData.admissions.forEach((admission) => {
        const option = document.createElement(
            "option"
        );

        option.value = admission._id;

        const patientName = getPatientName(
            admission.patient
        );

        option.textContent =
            `${admission.admissionNumber || "Admission"} — ${patientName}`;

        select.appendChild(option);
    });
}


function renderAllBedOptions() {
    renderPatientOptions("bedPatient", true);
    renderPatientOptions("assignPatient", false);

    renderAdmissionOptions(
        "bedAdmission",
        true
    );

    renderAdmissionOptions(
        "assignAdmission",
        true
    );
}


function getBedById(id) {
    return bedsData.beds.find(
        (bed) => String(bed._id) === String(id)
    );
}


function closeBedModal() {
    const modalElement =
        document.getElementById("bedModal");

    if (!modalElement) {
        return;
    }

    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    if (modal) {
        modal.hide();
    }
}


function closeAssignBedModal() {
    const modalElement =
        document.getElementById(
            "assignBedModal"
        );

    if (!modalElement) {
        return;
    }

    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    if (modal) {
        modal.hide();
    }
}