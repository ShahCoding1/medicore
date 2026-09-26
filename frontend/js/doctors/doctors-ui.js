function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatGender(gender) {
    if (!gender) return "—";

    return gender.charAt(0).toUpperCase() +
        gender.slice(1);
}


export function renderDoctors(
    doctors,
    onEdit,
    onDelete,
    onView
) {
    const tbody =
        document.getElementById("doctorsTableBody");

    if (!tbody) return;

    if (!doctors.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="text-muted">
                        No doctors found.
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = doctors.map((doctor) => `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(doctor.doctorId)}
                </strong>
            </td>

            <td>
                <div class="doctor-name">
                    ${escapeHtml(
                        `${doctor.firstName} ${doctor.lastName}`
                    )}
                </div>
                <small class="text-muted">
                    ${escapeHtml(doctor.email || "No email")}
                </small>
            </td>

            <td>
                ${escapeHtml(
                    doctor.specialization || "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    doctor.department?.name || "Unassigned"
                )}
            </td>

            <td>
                ${escapeHtml(doctor.phone || "—")}
            </td>

            <td>
                ${formatGender(doctor.gender)}
            </td>

            <td>
                <span class="doctor-status ${doctor.status}">
                    ${escapeHtml(
                        doctor.status
                            ? doctor.status
                                .charAt(0)
                                .toUpperCase() +
                              doctor.status.slice(1)
                            : "Unknown"
                    )}
                </span>
            </td>

            <td>
                ${doctor.licenseNumber
                    ? escapeHtml(doctor.licenseNumber)
                    : "—"}
            </td>

            <td>
                <div class="doctor-actions">

                    <button
                        class="btn btn-sm btn-light"
                        data-action="view"
                        data-id="${doctor._id}">
                        View
                    </button>

                    <button
                        class="btn btn-sm btn-outline-primary"
                        data-action="edit"
                        data-id="${doctor._id}">
                        Edit
                    </button>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        data-action="delete"
                        data-id="${doctor._id}">
                        Delete
                    </button>

                </div>
            </td>
        </tr>
    `).join("");

    tbody.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.action;
            const id = button.dataset.id;

            if (action === "view") {
                onView(id);
            }

            if (action === "edit") {
                onEdit(id);
            }

            if (action === "delete") {
                onDelete(id);
            }
        });
    });
}