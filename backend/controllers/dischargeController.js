const mongoose = require("mongoose");

const Discharge = require("../models/Discharge");
const Patient = require("../models/Patient");
const Admission = require("../models/Admission");
const Doctor = require("../models/Doctor");

const populateDischarge = (query) =>
    query
        .populate("patient", "firstName lastName patientId phone")
        .populate("admission", "admissionNumber admissionDate status")
        .populate("doctor", "firstName lastName doctorId specialization")
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getDischarges = async (req, res) => {
    try {
        const {
            search,
            patient,
            admission,
            doctor,
            dateFrom,
            dateTo,
            page = 1,
            limit = 50
        } = req.query;

        const filter = {};

        if (patient) {
            if (!validateObjectId(patient)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid patient ID."
                });
            }

            filter.patient = patient;
        }

        if (admission) {
            if (!validateObjectId(admission)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid admission ID."
                });
            }

            filter.admission = admission;
        }

        if (doctor) {
            if (!validateObjectId(doctor)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid doctor ID."
                });
            }

            filter.doctor = doctor;
        }

        if (dateFrom || dateTo) {
            filter.dischargeDate = {};

            if (dateFrom) {
                const from = new Date(dateFrom);

                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dateFrom."
                    });
                }

                from.setHours(0, 0, 0, 0);
                filter.dischargeDate.$gte = from;
            }

            if (dateTo) {
                const to = new Date(dateTo);

                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dateTo."
                    });
                }

                to.setHours(23, 59, 59, 999);
                filter.dischargeDate.$lte = to;
            }
        }

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");

            const [patients, doctors] = await Promise.all([
                Patient.find({
                    $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { patientId: searchRegex },
                        { phone: searchRegex }
                    ]
                }).select("_id"),

                Doctor.find({
                    $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { doctorId: searchRegex },
                        { specialization: searchRegex }
                    ]
                }).select("_id")
            ]);

            const patientIds = patients.map((item) => item._id);
            const doctorIds = doctors.map((item) => item._id);

            filter.$or = [
                { diagnosis: searchRegex },
                { treatment: searchRegex },
                { procedures: searchRegex },
                { medication: searchRegex },
                { condition: searchRegex },
                { followUp: searchRegex },
                { instructions: searchRegex },
                { dischargeSummary: searchRegex },
                { patient: { $in: patientIds } },
                { doctor: { $in: doctorIds } }
            ];
        }

        const pageNumber = Math.max(Number(page) || 1, 1);
        const pageSize = Math.min(Math.max(Number(limit) || 50, 1), 100);
        const skip = (pageNumber - 1) * pageSize;

        const [discharges, total] = await Promise.all([
            populateDischarge(
                Discharge.find(filter)
                    .sort({ dischargeDate: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(pageSize)
            ),

            Discharge.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: discharges,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total,
                pages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error("Get discharges error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve discharge records.",
            error: error.message
        });
    }
};

const getDischarge = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discharge ID."
            });
        }

        const discharge = await populateDischarge(
            Discharge.findById(id)
        );

        if (!discharge) {
            return res.status(404).json({
                success: false,
                message: "Discharge record not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: discharge
        });
    } catch (error) {
        console.error("Get discharge error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve discharge record.",
            error: error.message
        });
    }
};

const createDischarge = async (req, res) => {
    try {
        const {
            patient,
            admission,
            doctor,
            admissionDate,
            dischargeDate,
            diagnosis,
            treatment,
            procedures,
            medication,
            condition,
            followUp,
            instructions,
            dischargeSummary
        } = req.body;

        if (!patient || !admission || !admissionDate || !dischargeDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient, admission, admission date and discharge date are required."
            });
        }

        if (!validateObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        if (!validateObjectId(admission)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        if (doctor && !validateObjectId(doctor)) {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID."
            });
        }

        const parsedAdmissionDate = new Date(admissionDate);
        const parsedDischargeDate = new Date(dischargeDate);

        if (
            Number.isNaN(parsedAdmissionDate.getTime()) ||
            Number.isNaN(parsedDischargeDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission or discharge date."
            });
        }

        if (parsedDischargeDate < parsedAdmissionDate) {
            return res.status(400).json({
                success: false,
                message: "Discharge date cannot be before admission date."
            });
        }

        const [patientExists, admissionExists, doctorExists] =
            await Promise.all([
                Patient.findById(patient).select("_id"),
                Admission.findById(admission).select(
                    "_id patient admissionDate status attendingDoctor"
                ),
                doctor
                    ? Doctor.findById(doctor).select("_id")
                    : Promise.resolve(null)
            ]);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        if (!admissionExists) {
            return res.status(404).json({
                success: false,
                message: "Admission not found."
            });
        }

        if (String(admissionExists.patient) !== String(patient)) {
            return res.status(400).json({
                success: false,
                message:
                    "The selected admission does not belong to the selected patient."
            });
        }

        if (doctor && !doctorExists) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const existingDischarge = await Discharge.findOne({ admission });

        if (existingDischarge) {
            return res.status(409).json({
                success: false,
                message: "A discharge record already exists for this admission."
            });
        }

        const discharge = await Discharge.create({
            patient,
            admission,
            doctor: doctor || admissionExists.attendingDoctor || undefined,
            admissionDate: parsedAdmissionDate,
            dischargeDate: parsedDischargeDate,
            diagnosis,
            treatment,
            procedures,
            medication,
            condition,
            followUp,
            instructions,
            dischargeSummary,
            createdBy: req.user?.id
        });

        const populatedDischarge = await populateDischarge(
            Discharge.findById(discharge._id)
        );

        return res.status(201).json({
            success: true,
            message: "Discharge record created successfully.",
            data: populatedDischarge
        });
    } catch (error) {
        console.error("Create discharge error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create discharge record.",
            error: error.message
        });
    }
};

const updateDischarge = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discharge ID."
            });
        }

        const discharge = await Discharge.findById(id);

        if (!discharge) {
            return res.status(404).json({
                success: false,
                message: "Discharge record not found."
            });
        }

        const allowedFields = [
            "patient",
            "admission",
            "doctor",
            "admissionDate",
            "dischargeDate",
            "diagnosis",
            "treatment",
            "procedures",
            "medication",
            "condition",
            "followUp",
            "instructions",
            "dischargeSummary"
        ];

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                discharge[field] = req.body[field];
            }
        }

        if (!validateObjectId(discharge.patient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        if (!validateObjectId(discharge.admission)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        if (discharge.doctor && !validateObjectId(discharge.doctor)) {
            return res.status(400).json({
                success: false,
                message: "Invalid doctor ID."
            });
        }

        const [patientExists, admissionExists, doctorExists] =
            await Promise.all([
                Patient.findById(discharge.patient).select("_id"),
                Admission.findById(discharge.admission).select(
                    "_id patient admissionDate"
                ),
                discharge.doctor
                    ? Doctor.findById(discharge.doctor).select("_id")
                    : Promise.resolve(null)
            ]);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        if (!admissionExists) {
            return res.status(404).json({
                success: false,
                message: "Admission not found."
            });
        }

        if (
            String(admissionExists.patient) !==
            String(discharge.patient)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "The selected admission does not belong to the selected patient."
            });
        }

        if (discharge.doctor && !doctorExists) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const parsedAdmissionDate = new Date(discharge.admissionDate);
        const parsedDischargeDate = new Date(discharge.dischargeDate);

        if (
            Number.isNaN(parsedAdmissionDate.getTime()) ||
            Number.isNaN(parsedDischargeDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission or discharge date."
            });
        }

        if (parsedDischargeDate < parsedAdmissionDate) {
            return res.status(400).json({
                success: false,
                message: "Discharge date cannot be before admission date."
            });
        }

        if (req.body.admission && req.body.admission !== String(discharge.admission)) {
            const duplicate = await Discharge.findOne({
                admission: discharge.admission,
                _id: { $ne: discharge._id }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A discharge record already exists for this admission."
                });
            }
        }

        discharge.updatedBy = req.user?.id;

        await discharge.save();

        const populatedDischarge = await populateDischarge(
            Discharge.findById(discharge._id)
        );

        return res.status(200).json({
            success: true,
            message: "Discharge record updated successfully.",
            data: populatedDischarge
        });
    } catch (error) {
        console.error("Update discharge error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update discharge record.",
            error: error.message
        });
    }
};

const deleteDischarge = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid discharge ID."
            });
        }

        const discharge = await Discharge.findById(id);

        if (!discharge) {
            return res.status(404).json({
                success: false,
                message: "Discharge record not found."
            });
        }

        await Discharge.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Discharge record deleted successfully."
        });
    } catch (error) {
        console.error("Delete discharge error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete discharge record.",
            error: error.message
        });
    }
};

const getDischargeSummary = async (req, res) => {
    try {
        const [
            total,
            today,
            thisMonth
        ] = await Promise.all([
            Discharge.countDocuments(),

            Discharge.countDocuments({
                dischargeDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }),

            (() => {
                const start = new Date();
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                const end = new Date();
                end.setMonth(end.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);

                return Discharge.countDocuments({
                    dischargeDate: {
                        $gte: start,
                        $lte: end
                    }
                });
            })()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                today,
                thisMonth
            }
        });
    } catch (error) {
        console.error("Get discharge summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve discharge summary.",
            error: error.message
        });
    }
};

module.exports = {
    getDischarges,
    getDischarge,
    createDischarge,
    updateDischarge,
    deleteDischarge,
    getDischargeSummary
};