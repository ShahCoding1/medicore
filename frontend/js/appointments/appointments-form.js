import {
    createAppointment,
    updateAppointment,
    getAppointment
} from "./appointments-data.js";

const form =
    document.getElementById(
        "appointmentForm"
    );

const modalElement =
    document.getElementById(
        "appointmentModal"
    );

let editingAppointmentId = null;


// ============================================================
// DATE & TIME RESTRICTIONS
// ============================================================

function getTodayDateString() {
    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getCurrentTimeString() {
    const now = new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    return `${hours}:${minutes}`;
}


function updateAppointmentDateTimeRestrictions() {
    const dateInput =
        document.getElementById(
            "appointmentDate"
        );

    const timeInput =
        document.getElementById(
            "appointmentTime"
        );

    if (!dateInput || !timeInput) {
        return;
    }

    const today =
        getTodayDateString();

    const currentTime =
        getCurrentTimeString();

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    dateInput.min = today;

    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

    if (dateInput.value === today) {
        timeInput.min = currentTime;
    } else {
        timeInput.removeAttribute("min");
    }

    // --------------------------------------------------------
    // CLEAR INVALID TIME
    // --------------------------------------------------------

    if (
        dateInput.value === today &&
        timeInput.value &&
        timeInput.value < currentTime
    ) {
        timeInput.value = "";
    }
}


// ============================================================
// VALIDATE DATE & TIME BEFORE SUBMIT
// ============================================================

function validateAppointmentDateTime() {
    const dateInput =
        document.getElementById(
            "appointmentDate"
        );

    const timeInput =
        document.getElementById(
            "appointmentTime"
        );

    if (!dateInput || !timeInput) {
        return false;
    }

    const selectedDate =
        dateInput.value;

    const selectedTime =
        timeInput.value;

    if (!selectedDate || !selectedTime) {
        alert(
            "Please select an appointment date and time."
        );

        return false;
    }

    const selectedDateTime =
        new Date(
            `${selectedDate}T${selectedTime}`
        );

    const now =
        new Date();

    if (
        Number.isNaN(
            selectedDateTime.getTime()
        )
    ) {
        alert(
            "Please select a valid appointment date and time."
        );

        return false;
    }

    if (
        selectedDateTime <= now
    ) {
        alert(
            "Appointment date and time must be in the future. Past appointments cannot be scheduled."
        );

        updateAppointmentDateTimeRestrictions();

        return false;
    }

    return true;
}


// ============================================================
// LOAD PATIENTS
// ============================================================

async function loadPatients(
    selectedPatientId = ""
) {
    const select =
        document.getElementById(
            "appointmentPatient"
        );

    if (!select) {
        return;
    }

    select.disabled = true;

    select.innerHTML = `
        <option value="">
            Loading patients...
        </option>
    `;

    try {
        const response =
            await window.mediCoreAPI.get(
                "/patients",
                {
                    params: {
                        status: "active"
                    }
                }
            );

        const patients =
            response.data?.data || [];

        select.innerHTML = `
            <option value="">
                Select patient
            </option>
        `;

        patients.forEach(
            (patient) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    patient._id;

                option.textContent =
                    `${patient.firstName} ${patient.lastName} (${patient.patientId})`;

                if (
                    String(
                        patient._id
                    ) ===
                    String(
                        selectedPatientId
                    )
                ) {
                    option.selected =
                        true;
                }

                select.appendChild(
                    option
                );
            }
        );
    } catch (error) {
        console.error(
            "Failed to load patients:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load patients
            </option>
        `;
    } finally {
        select.disabled = false;
    }
}


// ============================================================
// LOAD DOCTORS
// ============================================================

async function loadDoctors(
    selectedDoctorId = ""
) {
    const select =
        document.getElementById(
            "appointmentDoctor"
        );

    if (!select) {
        return;
    }

    select.disabled = true;

    select.innerHTML = `
        <option value="">
            Loading doctors...
        </option>
    `;

    try {
        const response =
            await window.mediCoreAPI.get(
                "/doctors",
                {
                    params: {
                        status: "active"
                    }
                }
            );

        const doctors =
            response.data?.data || [];

        select.innerHTML = `
            <option value="">
                Select doctor
            </option>
        `;

        doctors.forEach(
            (doctor) => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    doctor._id;

                option.textContent =
                    `Dr. ${doctor.firstName} ${doctor.lastName} — ${doctor.specialization}`;

                if (
                    String(
                        doctor._id
                    ) ===
                    String(
                        selectedDoctorId
                    )
                ) {
                    option.selected =
                        true;
                }

                select.appendChild(
                    option
                );
            }
        );
    } catch (error) {
        console.error(
            "Failed to load doctors:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load doctors
            </option>
        `;
    } finally {
        select.disabled = false;
    }
}


// ============================================================
// GET FORM DATA
// ============================================================

function getFormData() {
    const date =
        document.getElementById(
            "appointmentDate"
        ).value;

    const time =
        document.getElementById(
            "appointmentTime"
        ).value;

    return {
        patient:
            document.getElementById(
                "appointmentPatient"
            ).value,

        doctor:
            document.getElementById(
                "appointmentDoctor"
            ).value,

        appointmentDate:
            `${date}T${time}`,

        reason:
            document.getElementById(
                "appointmentReason"
            ).value.trim(),

        status:
            document.getElementById(
                "appointmentStatus"
            ).value
    };
}


// ============================================================
// RESET FORM
// ============================================================

function resetAppointmentForm() {
    if (form) {
        form.reset();
    }

    editingAppointmentId = null;

    const title =
        document.getElementById(
            "appointmentModalTitle"
        );

    if (title) {
        title.textContent =
            "Add Appointment";
    }

    const status =
        document.getElementById(
            "appointmentStatus"
        );

    if (status) {
        status.value =
            "scheduled";
    }

    updateAppointmentDateTimeRestrictions();
}


// ============================================================
// FORM SUBMIT
// ============================================================

async function handleSubmit(
    event
) {
    event.preventDefault();

    // --------------------------------------------------------
    // VALIDATE DATE/TIME FIRST
    // --------------------------------------------------------

    if (
        !validateAppointmentDateTime()
    ) {
        return;
    }

    const data =
        getFormData();

    if (
        !data.patient ||
        !data.doctor ||
        !data.appointmentDate
    ) {
        alert(
            "Please complete all required fields."
        );

        return;
    }

    try {
        if (editingAppointmentId) {
            await updateAppointment(
                editingAppointmentId,
                data
            );
        } else {
            await createAppointment(
                data
            );
        }

        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );

        modal?.hide();

        resetAppointmentForm();

        if (
            typeof window.loadAppointments ===
            "function"
        ) {
            await window.loadAppointments();
        }

    } catch (error) {
        console.error(
            "Appointment form error:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to save appointment."
        );
    }
}


// ============================================================
// EDIT APPOINTMENT
// ============================================================

async function editAppointment(
    id
) {
    try {
        const response =
            await getAppointment(id);

        const appointment =
            response.data;

        if (!appointment) {
            throw new Error(
                "Appointment data not found."
            );
        }

        editingAppointmentId =
            appointment._id;

        document.getElementById(
            "appointmentModalTitle"
        ).textContent =
            "Edit Appointment";

        await Promise.all([
            loadPatients(
                appointment.patient?._id ||
                appointment.patient
            ),

            loadDoctors(
                appointment.doctor?._id ||
                appointment.doctor
            )
        ]);

        const appointmentDate =
            new Date(
                appointment.appointmentDate
            );

        const year =
            appointmentDate.getFullYear();

        const month =
            String(
                appointmentDate.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                appointmentDate.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                appointmentDate.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                appointmentDate.getMinutes()
            ).padStart(2, "0");

        document.getElementById(
            "appointmentDate"
        ).value =
            `${year}-${month}-${day}`;

        document.getElementById(
            "appointmentTime"
        ).value =
            `${hours}:${minutes}`;

        document.getElementById(
            "appointmentReason"
        ).value =
            appointment.reason || "";

        document.getElementById(
            "appointmentStatus"
        ).value =
            appointment.status ||
            "scheduled";

        updateAppointmentDateTimeRestrictions();

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();

    } catch (error) {
        console.error(
            "Failed to load appointment:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to load appointment."
        );
    }
}


// ============================================================
// OPEN NEW APPOINTMENT FORM
// ============================================================

async function openNewAppointmentForm() {
    console.log(
        "Opening Add Appointment form..."
    );

    resetAppointmentForm();

    await Promise.all([
        loadPatients(),
        loadDoctors()
    ]);

    updateAppointmentDateTimeRestrictions();

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeAppointmentModal() {
    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );

    modal?.hide();

    resetAppointmentForm();
}


// ============================================================
// INITIALIZE FORM
// ============================================================

function initAppointmentForm() {
    if (!form) {
        console.error(
            "Appointment form not found."
        );

        return;
    }

    form.addEventListener(
        "submit",
        handleSubmit
    );

    const dateInput =
        document.getElementById(
            "appointmentDate"
        );

    const timeInput =
        document.getElementById(
            "appointmentTime"
        );

    // Update time restriction whenever
    // the selected date changes.
    dateInput?.addEventListener(
        "change",
        () => {
            updateAppointmentDateTimeRestrictions();
        }
    );

    // Re-check the current time whenever
    // the user changes the time.
    timeInput?.addEventListener(
        "change",
        () => {
            updateAppointmentDateTimeRestrictions();
        }
    );

    // Keep the restriction fresh while
    // the appointment modal is open.
    setInterval(() => {
        updateAppointmentDateTimeRestrictions();
    }, 30000);

    updateAppointmentDateTimeRestrictions();
}


// ============================================================
// GLOBAL HELPERS
// ============================================================

window.openNewAppointmentForm =
    openNewAppointmentForm;

window.closeAppointmentModal =
    closeAppointmentModal;


// ============================================================
// EXPORTS
// ============================================================

export {
    initAppointmentForm,
    openNewAppointmentForm,
    editAppointment
};