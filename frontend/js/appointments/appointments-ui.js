// ==========================================
// FORMAT DATE
// ==========================================

function formatAppointmentDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

// ==========================================
// FORMAT TIME
// ==========================================

function formatAppointmentTime(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// ==========================================
// STATUS LABEL
// ==========================================

function getStatusLabel(status) {
    const labels = {
        scheduled: "Scheduled",
        completed: "Completed",
        cancelled: "Cancelled",
        no_show: "No Show"
    };

    return labels[status] || status || "Unknown";
}

// ==========================================
// STATUS HTML
// ==========================================

function renderStatus(status) {
    return `
        <span class="appointment-status ${status}">
            ${getStatusLabel(status)}
        </span>
    `;
}

// ==========================================
// RENDER APPOINTMENTS
// ==========================================

function renderAppointments(
    appointments,
    onEdit,
    onDelete,
    onView
) {
    const tbody =
        document.getElementById(
            "appointmentsTableBody"
        );

    if (!tbody) {
        return;
    }

    if (
        !appointments ||
        appointments.length === 0
    ) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center
                           text-muted
                           py-5"
                >
                    No appointments found.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        appointments
            .map((appointment) => {

                const patient =
                    appointment.patient;

                const doctor =
                    appointment.doctor;

                const patientName =
                    patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : "Unknown Patient";

                const doctorName =
                    doctor
                        ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                        : "Unknown Doctor";

                return `
                    <tr>

                        <td>
                            <div class="fw-semibold">
                                ${formatAppointmentDate(
                                    appointment.appointmentDate
                                )}
                            </div>

                            <div class="small text-muted">
                                ${formatAppointmentTime(
                                    appointment.appointmentDate
                                )}
                            </div>
                        </td>

                        <td>
                            <div class="fw-semibold">
                                ${patientName}
                            </div>

                            <div class="small text-muted">
                                ${
                                    patient?.patientId ||
                                    "—"
                                }
                            </div>
                        </td>

                        <td>
                            <div class="fw-semibold">
                                ${doctorName}
                            </div>

                            <div class="small text-muted">
                                ${
                                    doctor?.specialization ||
                                    "—"
                                }
                            </div>
                        </td>

                        <td>
                            ${
                                appointment.reason
                                    ? appointment.reason
                                    : "—"
                            }
                        </td>

                        <td>
                            ${renderStatus(
                                appointment.status
                            )}
                        </td>

                        <td class="text-end">

                            <div
                                class="d-flex
                                       justify-content-end
                                       gap-2"
                            >

                                <button
                                    type="button"
                                    class="appointment-action-btn"
                                    data-action="view"
                                    data-id="${appointment._id}"
                                    title="View"
                                >
                                    👁
                                </button>

                                <button
                                    type="button"
                                    class="appointment-action-btn"
                                    data-action="edit"
                                    data-id="${appointment._id}"
                                    title="Edit"
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    class="appointment-action-btn"
                                    data-action="delete"
                                    data-id="${appointment._id}"
                                    title="Delete"
                                >
                                    🗑
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            })
            .join("");

    // ======================================
    // VIEW
    // ======================================

    tbody
        .querySelectorAll(
            '[data-action="view"]'
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    onView(
                        button.dataset.id
                    );
                }
            );
        });

    // ======================================
    // EDIT
    // ======================================

    tbody
        .querySelectorAll(
            '[data-action="edit"]'
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    onEdit(
                        button.dataset.id
                    );
                }
            );
        });

    // ======================================
    // DELETE
    // ======================================

    tbody
        .querySelectorAll(
            '[data-action="delete"]'
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {
                    onDelete(
                        button.dataset.id
                    );
                }
            );
        });
}

// ==========================================
// EXPORT
// ==========================================

export {
    renderAppointments
};