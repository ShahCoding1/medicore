const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const getPrescriptions = async (req, res, next) => {
    try {
        const {
            search,
            patient,
            doctor,
            status,
            date,
            page = 1,
            limit = 50
        } = req.query;

        const filter = {};

        if (patient) {
            filter.patient = patient;
        }

        if (doctor) {
            filter.doctor = doctor;
        }

        if (status) {
            filter.status = status;
        }

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            filter.prescriptionDate = {
                $gte: start,
                $lt: end
            };
        }

        if (search) {
            const regex = new RegExp(
                search.trim(),
                "i"
            );

            const [
                matchingPatients,
                matchingDoctors
            ] = await Promise.all([
                Patient.find({
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { email: regex }
                    ]
                }).select("_id"),

                Doctor.find({
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { specialization: regex }
                    ]
                }).select("_id")
            ]);

            filter.$or = [
                {
                    diagnosis: regex
                },
                {
                    "medicines.name": regex
                },
                {
                    "medicines.dosage": regex
                },
                {
                    "medicines.frequency": regex
                },
                {
                    patient: {
                        $in: matchingPatients.map(
                            (item) => item._id
                        )
                    }
                },
                {
                    doctor: {
                        $in: matchingDoctors.map(
                            (item) => item._id
                        )
                    }
                }
            ];
        }

        const pageNumber =
            Math.max(Number(page), 1);

        const limitNumber =
            Math.min(
                Math.max(Number(limit), 1),
                100
            );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [
            prescriptions,
            total
        ] = await Promise.all([
            Prescription.find(filter)
                .populate(
                    "patient",
                    "firstName lastName email phone"
                )
                .populate(
                    "doctor",
                    "firstName lastName specialization department"
                )
                .populate(
                    "createdBy",
                    "firstName lastName email"
                )
                .populate(
                    "updatedBy",
                    "firstName lastName email"
                )
                .sort({
                    prescriptionDate: -1,
                    createdAt: -1
                })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Prescription.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: prescriptions,
            prescriptions,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(
                    total / limitNumber
                )
            }
        });

    } catch (error) {
        next(error);
    }
};


const getPrescription = async (req, res, next) => {
    try {
        const prescription =
            await Prescription.findById(
                req.params.id
            )
                .populate(
                    "patient",
                    "firstName lastName email phone"
                )
                .populate(
                    "doctor",
                    "firstName lastName specialization department"
                )
                .populate(
                    "createdBy",
                    "firstName lastName email"
                )
                .populate(
                    "updatedBy",
                    "firstName lastName email"
                );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found."
            });
        }

        res.status(200).json({
            success: true,
            data: prescription,
            prescription
        });

    } catch (error) {
        next(error);
    }
};


const createPrescription = async (
    req,
    res,
    next
) => {
    try {
        const {
            patient,
            doctor,
            diagnosis,
            prescriptionDate,
            medicines,
            instructions,
            refills,
            status
        } = req.body;

        if (
            !patient ||
            !doctor ||
            !diagnosis
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor and diagnosis are required."
            });
        }

        if (
            !Array.isArray(medicines) ||
            medicines.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one medicine is required."
            });
        }

        const [
            patientExists,
            doctorExists
        ] = await Promise.all([
            Patient.exists({
                _id: patient
            }),

            Doctor.exists({
                _id: doctor
            })
        ]);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        if (!doctorExists) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        const prescription =
            await Prescription.create({
                patient,
                doctor,
                diagnosis,
                prescriptionDate:
                    prescriptionDate || Date.now(),
                medicines,
                instructions,
                refills:
                    refills === undefined
                        ? 0
                        : refills,
                status:
                    status || "active",
                createdBy:
                    req.user?.id
            });

        const populated =
            await Prescription.findById(
                prescription._id
            )
                .populate(
                    "patient",
                    "firstName lastName email phone"
                )
                .populate(
                    "doctor",
                    "firstName lastName specialization department"
                );

        res.status(201).json({
            success: true,
            message:
                "Prescription created successfully.",
            data: populated,
            prescription: populated
        });

    } catch (error) {
        next(error);
    }
};


const updatePrescription = async (
    req,
    res,
    next
) => {
    try {
        const prescription =
            await Prescription.findById(
                req.params.id
            );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found."
            });
        }

        const allowedFields = [
            "patient",
            "doctor",
            "diagnosis",
            "prescriptionDate",
            "medicines",
            "instructions",
            "refills",
            "status"
        ];

        allowedFields.forEach(
            (field) => {
                if (
                    req.body[field] !== undefined
                ) {
                    prescription[field] =
                        req.body[field];
                }
            }
        );

        if (req.body.patient) {
            const exists =
                await Patient.exists({
                    _id: req.body.patient
                });

            if (!exists) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Patient not found."
                });
            }
        }

        if (req.body.doctor) {
            const exists =
                await Doctor.exists({
                    _id: req.body.doctor
                });

            if (!exists) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Doctor not found."
                });
            }
        }

        prescription.updatedBy =
            req.user?.id;

        await prescription.save();

        const populated =
            await Prescription.findById(
                prescription._id
            )
                .populate(
                    "patient",
                    "firstName lastName email phone"
                )
                .populate(
                    "doctor",
                    "firstName lastName specialization department"
                );

        res.status(200).json({
            success: true,
            message:
                "Prescription updated successfully.",
            data: populated,
            prescription: populated
        });

    } catch (error) {
        next(error);
    }
};


const deletePrescription = async (
    req,
    res,
    next
) => {
    try {
        const prescription =
            await Prescription.findById(
                req.params.id
            );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found."
            });
        }

        await prescription.deleteOne();

        res.status(200).json({
            success: true,
            message:
                "Prescription deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};


const getPrescriptionSummary = async (
    req,
    res,
    next
) => {
    try {
        const [
            total,
            active,
            completed,
            cancelled
        ] = await Promise.all([
            Prescription.countDocuments(),

            Prescription.countDocuments({
                status: "active"
            }),

            Prescription.countDocuments({
                status: "completed"
            }),

            Prescription.countDocuments({
                status: "cancelled"
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                active,
                completed,
                cancelled
            }
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getPrescriptions,
    getPrescription,
    createPrescription,
    updatePrescription,
    deletePrescription,
    getPrescriptionSummary
};