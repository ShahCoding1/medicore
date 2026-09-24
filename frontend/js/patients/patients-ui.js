export function renderPatients(
    patients,
    onEdit,
    onDelete
) {
    const tbody =
        document.getElementById(
            "patientsTableBody"
        );

    if (!tbody) return;

    if (!patients.length) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center text-muted py-5"
                >
                    No patients found.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = patients
        .map(patient => `
            <tr>
                <td>
                    <strong>
                        ${escapeHtml(
                            patient.patientId
                        )}
                    </strong>
                </td>

                <td>
                    <div class="fw-semibold">
                        ${escapeHtml(
                            patient.firstName
                        )}
                        ${escapeHtml(
                            patient.lastName
                        )}
                    </div>
                </td>

                <td>
                    ${formatGender(
                        patient.gender
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        patient.phone || "—"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        patient.department?.name ||
                        "—"
                    )}
                </td>

                <td>
                    ${
                        patient.dateOfBirth
                            ? new Date(
                                patient.dateOfBirth
                            ).toLocaleDateString()
                            : "—"
                    }
                </td>

                <td>
                    <span class="badge ${
                        patient.status === "active"
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-secondary"
                    }">
                        ${escapeHtml(
                            patient.status
                        )}
                    </span>
                </td>

                <td>
                    <div class="d-flex gap-1">
                        <button
                            class="btn btn-sm btn-light"
                            data-edit-patient="${
                                patient._id
                            }"
                            type="button"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-sm btn-outline-danger"
                            data-delete-patient="${
                                patient._id
                            }"
                            type="button"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `)
        .join("");

    tbody
        .querySelectorAll(
            "[data-edit-patient]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    onEdit(
                        button.dataset.editPatient
                    );
                }
            );
        });

    tbody
        .querySelectorAll(
            "[data-delete-patient]"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    onDelete(
                        button.dataset.deletePatient
                    );
                }
            );
        });
}

function formatGender(gender) {
    if (!gender) return "—";

    return gender.charAt(0).toUpperCase() +
        gender.slice(1);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}