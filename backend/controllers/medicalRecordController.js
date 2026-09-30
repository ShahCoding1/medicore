const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");


// ============================================================
// GET USER HOSPITAL
// ============================================================

async function getUserHospital(userId) {
    return Hospital.findOne({
        owner: userId
    });
}


// ============================================================
// GET ALL MEDICAL RECORDS
// ============================================================

const getMedicalRecords = async (req, res) => {
    try {
        const hospital =
            await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const {
            search = "",
            patient = "",
            doctor = "",
            date = ""
        } = req.query;

        const query = {
            hospital: hospital._id
        };

        if (patient) {
            query.patient = patient;
        }

        if (doctor) {
            query.doctor = doctor;
        }

        if (date) {
            const startOfDay =
                new Date(`${date}T00:00:00`);

            const endOfDay =
                new Date(`${date}T23:59:59.999`);

            query.recordDate = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        let records =
            await MedicalRecord.find(query)
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender dateOfBirth"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName specialization"
                )
                .sort({
                    recordDate: -1
                });

        // --------------------------------------------------------
        // SEARCH
        // --------------------------------------------------------

        if (search.trim()) {
            const searchText =
                search.trim().toLowerCase();

            records = records.filter(
                (record) => {
                    const patient =
                        record.patient;

                    const doctor =
                        record.doctor;

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

                        record.chiefComplaint
                            ?.toLowerCase()
                            .includes(searchText) ||

                        record.diagnosis
                            ?.toLowerCase()
                            .includes(searchText) ||

                        record.symptoms
                            ?.toLowerCase()
                            .includes(searchText)
                    );
                }
            );
        }

        return res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error(
            "Get medical records error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load medical records."
        });
    }
};


// ============================================================
// GET SINGLE MEDICAL RECORD
// ============================================================

const getMedicalRecordById = async (
    req,
    res
) => {
    try {
        const hospital =
            await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const record =
            await MedicalRecord.findOne({
                _id: req.params.id,
                hospital: hospital._id
            })
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender dateOfBirth"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName specialization"
                );

        if (!record) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical record not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: record
        });

    } catch (error) {
        console.error(
            "Get medical record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load medical record."
        });
    }
};


// ============================================================
// CREATE MEDICAL RECORD
// ============================================================

const createMedicalRecord = async (
    req,
    res
) => {
    try {
        const {
            patient,
            doctor,
            recordDate,
            chiefComplaint,
            symptoms,
            diagnosis,
            treatmentPlan,
            notes
        } = req.body;

        // --------------------------------------------------------
        // REQUIRED FIELDS
        // --------------------------------------------------------

        if (
            !patient ||
            !doctor ||
            !recordDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor, and record date are required."
            });
        }

        // --------------------------------------------------------
        // VALIDATE DATE
        // --------------------------------------------------------

        const parsedDate =
            new Date(recordDate);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid medical record date."
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

        // --------------------------------------------------------
        // CREATE RECORD
        // --------------------------------------------------------

        const record =
            await MedicalRecord.create({
                hospital: hospital._id,
                patient: patientRecord._id,
                doctor: doctorRecord._id,
                recordDate: parsedDate,
                chiefComplaint:
                    chiefComplaint?.trim() || "",
                symptoms:
                    symptoms?.trim() || "",
                diagnosis:
                    diagnosis?.trim() || "",
                treatmentPlan:
                    treatmentPlan?.trim() || "",
                notes:
                    notes?.trim() || ""
            });

        const populatedRecord =
            await MedicalRecord.findById(
                record._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender dateOfBirth"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName specialization"
                );

        return res.status(201).json({
            success: true,
            message:
                "Medical record created successfully.",
            data: populatedRecord
        });

    } catch (error) {
        console.error(
            "Create medical record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create medical record."
        });
    }
};


// ============================================================
// UPDATE MEDICAL RECORD
// ============================================================

const updateMedicalRecord = async (
    req,
    res
) => {
    try {
        const hospital =
            await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const record =
            await MedicalRecord.findOne({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!record) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical record not found."
            });
        }

        const {
            patient,
            doctor,
            recordDate,
            chiefComplaint,
            symptoms,
            diagnosis,
            treatmentPlan,
            notes
        } = req.body;

        // --------------------------------------------------------
        // DATE
        // --------------------------------------------------------

        if (recordDate !== undefined) {
            const parsedDate =
                new Date(recordDate);

            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please provide a valid medical record date."
                });
            }

            record.recordDate =
                parsedDate;
        }

        // --------------------------------------------------------
        // PATIENT
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

            record.patient =
                patientRecord._id;
        }

        // --------------------------------------------------------
        // DOCTOR
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

            record.doctor =
                doctorRecord._id;
        }

        // --------------------------------------------------------
        // CLINICAL FIELDS
        // --------------------------------------------------------

        if (
            chiefComplaint !== undefined
        ) {
            record.chiefComplaint =
                chiefComplaint.trim();
        }

        if (
            symptoms !== undefined
        ) {
            record.symptoms =
                symptoms.trim();
        }

        if (
            diagnosis !== undefined
        ) {
            record.diagnosis =
                diagnosis.trim();
        }

        if (
            treatmentPlan !== undefined
        ) {
            record.treatmentPlan =
                treatmentPlan.trim();
        }

        if (notes !== undefined) {
            record.notes =
                notes.trim();
        }

        await record.save();

        const updatedRecord =
            await MedicalRecord.findById(
                record._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName phone gender dateOfBirth"
                )
                .populate(
                    "doctor",
                    "doctorId firstName lastName specialization"
                );

        return res.status(200).json({
            success: true,
            message:
                "Medical record updated successfully.",
            data: updatedRecord
        });

    } catch (error) {
        console.error(
            "Update medical record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update medical record."
        });
    }
};


// ============================================================
// DELETE MEDICAL RECORD
// ============================================================

const deleteMedicalRecord = async (
    req,
    res
) => {
    try {
        const hospital =
            await getUserHospital(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found."
            });
        }

        const record =
            await MedicalRecord.findOneAndDelete({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!record) {
            return res.status(404).json({
                success: false,
                message:
                    "Medical record not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Medical record deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete medical record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete medical record."
        });
    }
};


module.exports = {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
};