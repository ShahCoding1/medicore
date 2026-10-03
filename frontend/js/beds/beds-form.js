function resetBedForm() {
    const form = document.getElementById(
        "bedForm"
    );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "bedType"
    ).value = "general";

    document.getElementById(
        "bedStatus"
    ).value = "available";

    document.getElementById(
        "bedPatient"
    ).value = "";

    document.getElementById(
        "bedAdmission"
    ).value = "";

    hideBedFormAlert();
}


function populateBedForm(bed) {
    document.getElementById(
        "bedNumber"
    ).value = bed.bedNumber || "";

    document.getElementById(
        "bedWard"
    ).value = bed.ward || "";

    document.getElementById(
        "bedRoom"
    ).value = bed.roomNumber || "";

    document.getElementById(
        "bedFloor"
    ).value = bed.floor || "";

    document.getElementById(
        "bedType"
    ).value = bed.bedType || "general";

    document.getElementById(
        "bedStatus"
    ).value = bed.status || "available";

    document.getElementById(
        "bedPatient"
    ).value =
        typeof bed.patient === "object"
            ? bed.patient?._id || ""
            : bed.patient || "";

    document.getElementById(
        "bedAdmission"
    ).value =
        typeof bed.admission === "object"
            ? bed.admission?._id || ""
            : bed.admission || "";

    document.getElementById(
        "bedNotes"
    ).value = bed.notes || "";
}


function openCreateBedModal() {
    bedsData.editingId = null;

    resetBedForm();

    document.getElementById(
        "bedModalLabel"
    ).textContent = "Add Bed";

    document.getElementById(
        "saveBedText"
    ).textContent = "Save Bed";

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "bedModal"
            )
        );

    modal.show();
}


async function openEditBedModal(id) {
    try {
        hideBedFormAlert();

        const localBed = getBedById(id);

        const bed =
            localBed || await getBed(id);

        bedsData.editingId = id;

        renderAllBedOptions();

        populateBedForm(bed);

        document.getElementById(
            "bedModalLabel"
        ).textContent = "Edit Bed";

        document.getElementById(
            "saveBedText"
        ).textContent = "Update Bed";

        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "bedModal"
                )
            );

        modal.show();

    } catch (error) {
        console.error(
            "Open edit bed error:",
            error
        );

        showBedToast(
            error.message ||
                "Unable to open bed.",
            "danger"
        );
    }
}


function collectBedFormData() {
    return {
        bedNumber:
            document.getElementById(
                "bedNumber"
            ).value.trim(),

        ward:
            document.getElementById(
                "bedWard"
            ).value.trim(),

        roomNumber:
            document.getElementById(
                "bedRoom"
            ).value.trim(),

        floor:
            document.getElementById(
                "bedFloor"
            ).value.trim(),

        bedType:
            document.getElementById(
                "bedType"
            ).value,

        status:
            document.getElementById(
                "bedStatus"
            ).value,

        patient:
            document.getElementById(
                "bedPatient"
            ).value || null,

        admission:
            document.getElementById(
                "bedAdmission"
            ).value || null,

        notes:
            document.getElementById(
                "bedNotes"
            ).value.trim()
    };
}


function validateBedForm(data) {
    if (!data.bedNumber) {
        return "Bed number is required.";
    }

    if (!data.ward) {
        return "Ward is required.";
    }

    if (
        data.bedNumber.length < 2
    ) {
        return "Please enter a valid bed number.";
    }

    return null;
}


async function handleBedFormSubmit(event) {
    event.preventDefault();

    const data =
        collectBedFormData();

    const validationError =
        validateBedForm(data);

    if (validationError) {
        showBedFormAlert(
            validationError
        );

        return;
    }

    const saveButton =
        document.getElementById(
            "saveBedBtn"
        );

    const spinner =
        document.getElementById(
            "saveBedSpinner"
        );

    const icon =
        document.getElementById(
            "saveBedIcon"
        );

    const text =
        document.getElementById(
            "saveBedText"
        );

    saveButton.disabled = true;

    spinner.classList.remove("d-none");
    icon.classList.add("d-none");

    text.textContent = bedsData.editingId
        ? "Updating..."
        : "Saving...";

    hideBedFormAlert();

    try {
        if (bedsData.editingId) {
            await updateBed(
                bedsData.editingId,
                data
            );

            showBedToast(
                "Bed updated successfully."
            );
        } else {
            await createBed(data);

            showBedToast(
                "Bed created successfully."
            );
        }

        closeBedModal();

        await refreshBeds();

    } catch (error) {
        console.error(
            "Save bed error:",
            error
        );

        showBedFormAlert(
            error.response?.data?.message ||
                error.message ||
                "Unable to save bed."
        );

    } finally {
        saveButton.disabled = false;

        spinner.classList.add("d-none");
        icon.classList.remove("d-none");

        text.textContent =
            bedsData.editingId
                ? "Update Bed"
                : "Save Bed";
    }
}


function openAssignBedModal(id) {
    const bed = getBedById(id);

    if (!bed) {
        showBedToast(
            "Bed information could not be found.",
            "danger"
        );

        return;
    }

    document.getElementById(
        "assignBedId"
    ).value = id;

    document.getElementById(
        "assignPatient"
    ).value = "";

    document.getElementById(
        "assignAdmission"
    ).value = "";

    document.getElementById(
        "assignBedSubtitle"
    ).textContent =
        `Assign a patient to bed ${bed.bedNumber}.`;

    hideAssignAlert();

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "assignBedModal"
            )
        );

    modal.show();
}


async function handleAssignBedSubmit(event) {
    event.preventDefault();

    const id =
        document.getElementById(
            "assignBedId"
        ).value;

    const patient =
        document.getElementById(
            "assignPatient"
        ).value;

    const admission =
        document.getElementById(
            "assignAdmission"
        ).value;

    if (!patient) {
        showAssignAlert(
            "Please select a patient."
        );

        return;
    }

    const button =
        document.getElementById(
            "confirmAssignBedBtn"
        );

    button.disabled = true;

    hideAssignAlert();

    try {
        await assignBed(
            id,
            patient,
            admission || null
        );

        closeAssignBedModal();

        showBedToast(
            "Bed assigned successfully."
        );

        await refreshBeds();

    } catch (error) {
        console.error(
            "Assign bed error:",
            error
        );

        showAssignAlert(
            error.response?.data?.message ||
                error.message ||
                "Unable to assign bed."
        );

    } finally {
        button.disabled = false;
    }
}


async function handleReleaseBed(id) {
    const bed = getBedById(id);

    if (!bed) {
        return;
    }

    const confirmed =
        window.confirm(
            `Release bed ${bed.bedNumber} and make it available?`
        );

    if (!confirmed) {
        return;
    }

    try {
        await releaseBed(id);

        showBedToast(
            "Bed released successfully."
        );

        await refreshBeds();

    } catch (error) {
        console.error(
            "Release bed error:",
            error
        );

        showBedToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to release bed.",
            "danger"
        );
    }
}


async function handleDeleteBed(id) {
    const bed = getBedById(id);

    if (!bed) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete bed ${bed.bedNumber}? This action cannot be undone.`
        );

    if (!confirmed) {
        return;
    }

    try {
        await deleteBed(id);

        showBedToast(
            "Bed deleted successfully."
        );

        await refreshBeds();

    } catch (error) {
        console.error(
            "Delete bed error:",
            error
        );

        showBedToast(
            error.response?.data?.message ||
                error.message ||
                "Unable to delete bed.",
            "danger"
        );
    }
}