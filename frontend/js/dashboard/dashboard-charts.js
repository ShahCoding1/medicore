/* =========================================================
   MEDICORE DASHBOARD UI
   ========================================================= */

export function initDashboardUI() {
    const user =
        window.mediCoreAuth?.getCurrentUser();

    if (!user) {
        return;
    }

    const name =
        user.name || "User";

    const firstName =
        name.split(" ")[0];

    const greetingName =
        document.getElementById(
            "dashboardUserName"
        );

    if (greetingName) {
        greetingName.textContent =
            firstName;
    }


    /* ==========================================
       DASHBOARD PERIOD FILTER
       ========================================== */

    document
        .querySelectorAll(".dashboard-filter")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".dashboard-filter"
                        )
                        .forEach((item) => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );

                }
            );

        });
}


/* ==========================================
   KPI RENDERING
   ========================================== */

export function renderDashboardKPIs(data) {

    const values =
        document.querySelectorAll(
            ".mc-dashboard-kpi-value"
        );

    if (values.length < 4) {
        return;
    }


    values[0].textContent =
        Number(
            data.patients || 0
        ).toLocaleString();


    values[1].textContent =
        Number(
            data.doctors || 0
        ).toLocaleString();


    values[2].textContent =
        Number(
            data.appointments || 0
        ).toLocaleString();


    values[3].textContent =
        `PKR ${Number(
            data.revenue || 0
        ).toLocaleString()}`;
}


/* ==========================================
   RECENT PATIENTS
   ========================================== */

export function renderRecentPatients(
    patients = []
) {

    const tableBody =
        document.getElementById(
            "recentPatientsTableBody"
        );

    if (!tableBody) {
        return;
    }


    if (!patients.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="dashboard-empty">

                        <div class="dashboard-empty-icon">
                            <i class="bi bi-people"></i>
                        </div>

                        <div class="dashboard-empty-title">
                            No patients found
                        </div>

                        <div class="dashboard-empty-text">
                            There is no recent patient activity
                            to display right now.
                        </div>

                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        patients
            .map((patient) => {

                const firstName =
                    patient.firstName || "";

                const lastName =
                    patient.lastName || "";

                const fullName =
                    `${firstName} ${lastName}`.trim()
                    || "Unknown Patient";


                const initials =
                    fullName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(
                            (part) =>
                                part
                                    .charAt(0)
                                    .toUpperCase()
                        )
                        .join("");


                const date =
                    patient.createdAt
                        ? new Date(
                            patient.createdAt
                        ).toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        )
                        : "—";


                const status =
                    patient.status || "active";


                return `
                    <tr>

                        <td>

                            <div class="dashboard-patient">

                                <div class="dashboard-patient-avatar">
                                    ${initials || "P"}
                                </div>

                                <div>

                                    <div class="dashboard-patient-name">
                                        ${fullName}
                                    </div>

                                    <div class="dashboard-patient-id">
                                        Patient
                                    </div>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${patient.patientId || "—"}
                        </td>


                        <td>
                            ${patient.department?.name || "—"}
                        </td>


                        <td>
                            —
                        </td>


                        <td>
                            ${date}
                        </td>


                        <td>

                            <span class="dashboard-status">
                                ${status}
                            </span>

                        </td>


                        <td>

                            <button
                                class="dashboard-table-action"
                                type="button"
                                title="View patient"
                                aria-label="View patient"
                            >

                                <i class="bi bi-arrow-up-right"></i>

                            </button>

                        </td>

                    </tr>
                `;

            })
            .join("");
}


/* ==========================================
   APPOINTMENT TIMELINE
   ========================================== */

export function renderAppointmentTimeline(
    appointments = []
) {

    const timeline =
        document.getElementById(
            "appointmentTimeline"
        );

    if (!timeline) {
        return;
    }


    if (!appointments.length) {

        timeline.innerHTML = `
            <div class="dashboard-empty">

                <div class="dashboard-empty-icon">
                    <i class="bi bi-calendar2-check"></i>
                </div>

                <div class="dashboard-empty-title">
                    No appointments today
                </div>

                <div class="dashboard-empty-text">
                    There are no appointments scheduled
                    for today.
                </div>

            </div>
        `;

        return;
    }


    timeline.innerHTML =
        appointments
            .map((appointment) => {

                const time =
                    appointment.appointmentDate
                        ? new Date(
                            appointment.appointmentDate
                        ).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )
                        : "—";


                const patient =
                    appointment.patient
                        ? `${appointment.patient.firstName || ""}
                           ${appointment.patient.lastName || ""}`
                              .trim()
                        : "Patient";


                const doctor =
                    appointment.doctor?.name ||
                    "Doctor";


                const reason =
                    appointment.reason ||
                    "Consultation";


                return `
                    <div class="dashboard-appointment">

                        <div class="dashboard-appointment-time">
                            ${time}
                        </div>


                        <div class="dashboard-appointment-content">

                            <div class="dashboard-appointment-patient">
                                ${patient}
                            </div>


                            <div class="dashboard-appointment-details">
                                ${reason}
                                ·
                                ${doctor}
                            </div>


                            <span class="dashboard-appointment-tag">
                                Scheduled
                            </span>

                        </div>

                    </div>
                `;

            })
            .join("");
}