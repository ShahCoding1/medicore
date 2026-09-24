export function initDashboardUI() {
    const user = window.mediCoreAuth?.getCurrentUser();

    if (!user) return;

    const name = user.name || "User";
    const firstName = name.split(" ")[0];

    const greetingName =
        document.getElementById("dashboardUserName");

    if (greetingName) {
        greetingName.textContent = firstName;
    }

    document
        .querySelectorAll(".dashboard-filter")
        .forEach(button => {
            button.addEventListener("click", () => {
                document
                    .querySelectorAll(".dashboard-filter")
                    .forEach(item => {
                        item.classList.remove(
                            "active",
                            "btn-primary"
                        );

                        item.classList.add(
                            "btn-outline-secondary"
                        );
                    });

                button.classList.remove(
                    "btn-outline-secondary"
                );

                button.classList.add(
                    "active",
                    "btn-primary"
                );
            });
        });
}

export function renderDashboardKPIs(data) {
    const values = document.querySelectorAll(
        ".mc-dashboard-kpi-value"
    );

    if (values.length < 4) return;

    values[0].textContent =
        Number(data.patients || 0).toLocaleString();

    values[1].textContent =
        Number(data.doctors || 0).toLocaleString();

    values[2].textContent =
        Number(data.appointments || 0).toLocaleString();

    values[3].textContent =
        `PKR ${Number(data.revenue || 0).toLocaleString()}`;
}

export function renderRecentPatients(patients = []) {
    const tableBody =
        document.getElementById(
            "recentPatientsTableBody"
        );

    if (!tableBody) return;

    if (!patients.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-4">
                    No patients found.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = patients
        .map(patient => `
            <tr>
                <td>
                    <strong>
                        ${patient.firstName || ""}
                        ${patient.lastName || ""}
                    </strong>
                </td>

                <td>
                    ${patient.patientId || "—"}
                </td>

                <td>
                    ${patient.department?.name || "—"}
                </td>

                <td>—</td>

                <td>
                    ${patient.createdAt
                        ? new Date(
                            patient.createdAt
                        ).toLocaleDateString()
                        : "—"}
                </td>

                <td>
                    <span class="badge bg-success-subtle text-success">
                        ${patient.status || "active"}
                    </span>
                </td>

                <td>
                    <button
                        class="btn btn-sm btn-light"
                        type="button"
                    >
                        View
                    </button>
                </td>
            </tr>
        `)
        .join("");
}

export function renderAppointmentTimeline(
    appointments = []
) {
    const timeline =
        document.getElementById(
            "appointmentTimeline"
        );

    if (!timeline) return;

    if (!appointments.length) {
        timeline.innerHTML = `
            <div class="text-muted py-3">
                No appointments scheduled for today.
            </div>
        `;

        return;
    }

    timeline.innerHTML = appointments
        .map(appointment => {
            const time = appointment.appointmentDate
                ? new Date(
                    appointment.appointmentDate
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "—";

            const patient =
                appointment.patient
                    ? `${appointment.patient.firstName || ""}
                       ${appointment.patient.lastName || ""}`
                    : "Patient";

            const doctor =
                appointment.doctor?.name ||
                "Doctor";

            return `
                <div class="border-start border-3 ps-3 mb-4">
                    <div class="small text-muted mb-1">
                        ${time}
                    </div>

                    <strong>
                        ${patient.trim()}
                    </strong>

                    <div class="small text-muted">
                        ${appointment.reason || "Consultation"}
                        · ${doctor}
                    </div>
                </div>
            `;
        })
        .join("");
}