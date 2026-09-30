const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");


// ============================================================
// GET HOSPITAL
// ============================================================

async function getUserHospital(userId) {
    return Hospital.findOne({
        owner: userId
    });
}


// ============================================================
// VALIDATE APPOINTMENT DATE/TIME
// ============================================================

function validateFutureAppointmentDate(appointmentDate) {
    const selectedDate = new Date(appointmentDate);

    if (Number.isNaN(selectedDate.getTime())) {
        return {
            valid: false,
            message: "Please provide a valid appointment date and time."
        };
    }

    const now = new Date();

    if (selectedDate <= now) {
        return {
            valid: false,
            message:
                "Appointment date and time must be in the future. Past appointments cannot be scheduled."
        };
    }

    return {
        valid: true
    };
}


// ============================================================
// GET ALL APPOINTMENTS
// ============================================================

const getAppointments = async (req, res) => {
    try {
        const hospital = await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const {
            search = "",
            status = "",
            date = ""
        } = req.query;

        const query = {
            hospital: hospital._id
        };

        if (status) {
            query.status = status;
        }

        if (date) {
            const startOfDay = new Date(`${date}T00:00:00`);
            const endOfDay = new Date(`${date}T23:59:59.999`);

            query.appointmentDate = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        let appointments = await Appointment.find(query)
            .populate(
                "patient",
                "patientId firstName lastName phone gender"
            )
            .populate(
                "doctor",
                "doctorId firstName lastName email specialization"
            )
            .sort({
                appointmentDate: 1
            });

        // --------------------------------------------------------
        // SEARCH
        // --------------------------------------------------------

        if (search.trim()) {
            const searchText =
                search.trim().toLowerCase();

            appointments =
                appointments.filter((appointment) => {
                    const patient =
                        appointment.patient;

                    const doctor =
                        appointment.doctor;

                    const patientName =
                        patient
                            ? `${patient.firstName} ${patient.lastName}`
                            : "";

                    const doctorName =
                        doctor
                            ? `${doctor.firstName} ${doctor.lastName}`
                            : "";

                    return (
                        patientName
                            .toLowerCase()
                            .includes(searchText) ||

                        doctorName
                            .toLowerCase()
                            .includes(searchText) ||

                        patient?.patientId
                            ?.toLowerCase()
                            .includes(searchText) ||

                        doctor?.doctorId
                            ?.toLowerCase()
                            .includes(searchText) ||

                        appointment.reason
                            ?.toLowerCase()
                            .includes(searchText)
                    );
                });
        }

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error(
            "Get appointments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load appointments."
        });
    }
};


// ============================================================
// GET SINGLE APPOINTMENT
// ============================================================

const getAppointmentById = async (req, res) => {
    try {
        const hospital = await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const appointment =
            await Appointment.findOne({
                _id: req.params.id,
                hospital: hospital._id
            })
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName email specialization"
                );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        console.error(
            "Get appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load appointment."
        });
    }
};


// ============================================================
// CREATE APPOINTMENT
// ============================================================

const createAppointment = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            appointmentDate,
            reason,
            status
        } = req.body;

        // --------------------------------------------------------
        // REQUIRED FIELDS
        // --------------------------------------------------------

        if (
            !patient ||
            !doctor ||
            !appointmentDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor, and appointment date/time are required."
            });
        }

        // --------------------------------------------------------
        // FUTURE DATE/TIME VALIDATION
        // --------------------------------------------------------

        const dateValidation =
            validateFutureAppointmentDate(
                appointmentDate
            );

        if (!dateValidation.valid) {
            return res.status(400).json({
                success: false,
                message: dateValidation.message
            });
        }

        // --------------------------------------------------------
        // HOSPITAL
        // --------------------------------------------------------

        const hospital =
            await getUserHospital(
                req.user.id
            );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        // --------------------------------------------------------
        // PATIENT
        // --------------------------------------------------------

        const patientRecord =
            await Patient.findOne({
                _id: patient,
                hospital: hospital._id
            });

        if (!patientRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected patient was not found in this hospital."
            });
        }

        if (
            patientRecord.status !==
            "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment cannot be created for an inactive patient."
            });
        }

        // --------------------------------------------------------
        // DOCTOR
        // --------------------------------------------------------

        const doctorRecord =
            await Doctor.findOne({
                _id: doctor,
                hospital: hospital._id
            });

        if (!doctorRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected doctor was not found in this hospital."
            });
        }

        if (
            doctorRecord.status !==
            "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Appointment cannot be created for an inactive doctor."
            });
        }

        // --------------------------------------------------------
        // CREATE
        // --------------------------------------------------------

        const appointment =
            await Appointment.create({
                hospital: hospital._id,
                patient: patientRecord._id,
                doctor: doctorRecord._id,
                appointmentDate:
                    new Date(appointmentDate),
                reason:
                    reason?.trim() || "",
                status:
                    status || "scheduled"
            });

        const populatedAppointment =
            await Appointment.findById(
                appointment._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName email specialization"
                );

        return res.status(201).json({
            success: true,
            message:
                "Appointment created successfully.",
            data: populatedAppointment
        });

    } catch (error) {
        console.error(
            "Create appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create appointment."
        });
    }
};


// ============================================================
// UPDATE APPOINTMENT
// ============================================================

const updateAppointment = async (req, res) => {
    try {
        const hospital =
            await getUserHospital(
                req.user.id
            );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const appointment =
            await Appointment.findOne({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });
        }

        const {
            patient,
            doctor,
            appointmentDate,
            reason,
            status
        } = req.body;

        // --------------------------------------------------------
        // DATE/TIME VALIDATION
        // --------------------------------------------------------

        if (appointmentDate) {
            const dateValidation =
                validateFutureAppointmentDate(
                    appointmentDate
                );

            if (!dateValidation.valid) {
                return res.status(400).json({
                    success: false,
                    message:
                        dateValidation.message
                });
            }

            appointment.appointmentDate =
                new Date(appointmentDate);
        }

        // --------------------------------------------------------
        // PATIENT VALIDATION
        // --------------------------------------------------------

        if (patient) {
            const patientRecord =
                await Patient.findOne({
                    _id: patient,
                    hospital: hospital._id
                });

            if (!patientRecord) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected patient was not found in this hospital."
                });
            }

            if (
                patientRecord.status !==
                "active"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Appointment cannot be assigned to an inactive patient."
                });
            }

            appointment.patient =
                patientRecord._id;
        }

        // --------------------------------------------------------
        // DOCTOR VALIDATION
        // --------------------------------------------------------

        if (doctor) {
            const doctorRecord =
                await Doctor.findOne({
                    _id: doctor,
                    hospital: hospital._id
                });

            if (!doctorRecord) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected doctor was not found in this hospital."
                });
            }

            if (
                doctorRecord.status !==
                "active"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Appointment cannot be assigned to an inactive doctor."
                });
            }

            appointment.doctor =
                doctorRecord._id;
        }

        // --------------------------------------------------------
        // OTHER FIELDS
        // --------------------------------------------------------

        if (reason !== undefined) {
            appointment.reason =
                reason.trim();
        }

        if (status !== undefined) {
            appointment.status =
                status;
        }

        await appointment.save();

        const updatedAppointment =
            await Appointment.findById(
                appointment._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName email specialization"
                );

        return res.status(200).json({
            success: true,
            message:
                "Appointment updated successfully.",
            data: updatedAppointment
        });

    } catch (error) {
        console.error(
            "Update appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update appointment."
        });
    }
};


// ============================================================
// DELETE APPOINTMENT
// ============================================================

const deleteAppointment = async (req, res) => {
    try {
        const hospital =
            await getUserHospital(
                req.user.id
            );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const appointment =
            await Appointment.findOneAndDelete({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Appointment deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete appointment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete appointment."
        });
    }
};


module.exports = {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
};