function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getStatusBadge(status) {
    if (status === "active") {
        return `
            <span class="department-status active">
                Active
            </span>
        `;
    }

    return `
        <span class="department-status inactive">
            Inactive
        </span>
    `;
}

function getDepartmentHead(department) {
    if (!department.headOfDepartment) {
        return "Not assigned";
    }

    return `
        ${escapeHtml(
            department.headOfDepartment.firstName
        )}
        ${escapeHtml(
            department.headOfDepartment.lastName
        )}
    `;
}

export function renderDepartments(
    departments,
    onEdit,
    onDelete,
    onView
) {
    const tbody =
        document.getElementById(
            "departmentsTableBody"
        );

    const emptyState =
        document.getElementById(
            "departmentsEmptyState"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!departments.length) {
        if (emptyState) {
            emptyState.classList.remove(
                "d-none"
            );
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.add(
            "d-none"
        );
    }

    departments.forEach((department) => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="department-code">
                    ${escapeHtml(
                        department.code
                    )}
                </span>
            </td>

            <td>
                <div class="department-name">
                    ${escapeHtml(
                        department.name
                    )}
                </div>

                <div class="department-description">
                    ${escapeHtml(
                        department.description ||
                            "No description"
                    )}
                </div>
            </td>

            <td>
                ${getDepartmentHead(
                    department
                )}
            </td>

            <td>
                ${escapeHtml(
                    department.phone ||
                        "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    department.location ||
                        "—"
                )}
            </td>

            <td>
                ${getStatusBadge(
                    department.status
                )}
            </td>

            <td>
                <div class="department-actions">

                    <button
                        type="button"
                        class="btn btn-sm btn-light department-view"
                        data-id="${department._id}"
                        title="View department"
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary department-edit"
                        data-id="${department._id}"
                        title="Edit department"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger department-delete"
                        data-id="${department._id}"
                        title="Delete department"
                    >
                        Delete
                    </button>

                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    document
        .querySelectorAll(
            ".department-view"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    onView(button.dataset.id);
                }
            );
        });

    document
        .querySelectorAll(
            ".department-edit"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    onEdit(button.dataset.id);
                }
            );
        });

    document
        .querySelectorAll(
            ".department-delete"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    onDelete(button.dataset.id);
                }
            );
        });
}

export {
    escapeHtml
};