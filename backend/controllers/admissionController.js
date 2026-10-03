const mongoose = require("mongoose");

const Admission = require("../models/Admission");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

// --------------------------------------------------------------------------
// Populate admission references
// --------------------------------------------------------------------------

const populateAdmission = (query) => {
    return query
        .populate(
            "patient",
            "firstName lastName patientId phone gender dateOfBirth"
        )
        .populate(
            "attendingDoctor",
            "firstName lastName doctorId specialization"
        )
        .populate("department", "name code");
};

// --------------------------------------------------------------------------
// Normalize admission number
// --------------------------------------------------------------------------

const normalizeAdmissionNumber = (value) => {
    if (!value) return value;

    return String(value)
        .trim()
        .toUpperCase();
};

// --------------------------------------------------------------------------
// Validate MongoDB ObjectId
// --------------------------------------------------------------------------

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/*
|--------------------------------------------------------------------------
| GET /api/admissions
|--------------------------------------------------------------------------
*/

const getAdmissions = async (req, res) => {
    try {
        const {
            search,
            status,
            admissionType,
            priority,
            patient,
            doctor,
            department,
            dateFrom,
            dateTo
        } = req.query;

        const filter = {};

        // Status filter
        if (status) {
            filter.status = status;
        }

        // Admission type filter
        if (admissionType) {
            filter.admissionType = admissionType;
        }

        // Priority filter
        if (priority) {
            filter.priority = priority;
        }

        // Patient filter
        if (patient && validateObjectId(patient)) {
            filter.patient = patient;
        }

        // Doctor filter
        if (doctor && validateObjectId(doctor)) {
            filter.attendingDoctor = doctor;
        }

        // Department filter
        if (department && validateObjectId(department)) {
            filter.department = department;
        }

        // Date range filter
        if (dateFrom || dateTo) {
            filter.admissionDate = {};

            if (dateFrom) {
                const from = new Date(dateFrom);

                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dateFrom value."
                    });
                }

                from.setHours(0, 0, 0, 0);
                filter.admissionDate.$gte = from;
            }

            if (dateTo) {
                const to = new Date(dateTo);

                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid dateTo value."
                    });
                }

                to.setHours(23, 59, 59, 999);
                filter.admissionDate.$lte = to;
            }
        }

        let query = Admission.find(filter).sort({
            admissionDate: -1,
            createdAt: -1
        });

        // Search
        if (search) {
            const searchRegex = new RegExp(
                String(search).trim(),
                "i"
            );

            // Search matching patients
            const matchingPatients = await Patient.find({
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { patientId: searchRegex },
                    { phone: searchRegex }
                ]
            }).select("_id");

            // Search matching doctors
            const matchingDoctors = await Doctor.find({
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { doctorId: searchRegex },
                    { specialization: searchRegex }
                ]
            }).select("_id");

            const searchConditions = [
                { admissionNumber: searchRegex },
                { reason: searchRegex },
                { diagnosis: searchRegex },
                { roomNumber: searchRegex },
                { bedNumber: searchRegex },
                { ward: searchRegex }
            ];

            // Add patient matches
            if (matchingPatients.length > 0) {
                searchConditions.push({
                    patient: {
                        $in: matchingPatients.map(
                            (item) => item._id
                        )
                    }
                });
            }

            // Add doctor matches
            if (matchingDoctors.length > 0) {
                searchConditions.push({
                    attendingDoctor: {
                        $in: matchingDoctors.map(
                            (item) => item._id
                        )
                    }
                });
            }

            query = Admission.find({
                $and: [
                    filter,
                    {
                        $or: searchConditions
                    }
                ]
            }).sort({
                admissionDate: -1,
                createdAt: -1
            });
        }

        const admissions = await populateAdmission(query);

        return res.status(200).json({
            success: true,
            count: admissions.length,
            data: admissions
        });
    } catch (error) {
        console.error(
            "Get admissions error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve admissions.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/admissions/:id
|--------------------------------------------------------------------------
*/

const getAdmission = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        const admission = await populateAdmission(
            Admission.findById(id)
        );

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: "Admission not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: admission
        });
    } catch (error) {
        console.error(
            "Get admission error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve admission.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

/*
|--------------------------------------------------------------------------
| POST /api/admissions
|--------------------------------------------------------------------------
*/

const createAdmission = async (req, res) => {
    try {
        const {
            admissionNumber,
            patient,
            attendingDoctor,
            department,
            admissionDate,
            expectedDischargeDate,
            admissionType,
            priority,
            reason,
            diagnosis,
            symptoms,
            roomNumber,
            bedNumber,
            ward,
            status,
            notes
        } = req.body;

        // Required admission number
        if (!admissionNumber) {
            return res.status(400).json({
                success: false,
                message: "Admission number is required."
            });
        }

        // Required patient
        if (!patient) {
            return res.status(400).json({
                success: false,
                message: "Patient is required."
            });
        }

        // Required reason
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Admission reason is required."
            });
        }

        // Validate patient ID
        if (!validateObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        // Check duplicate admission number
        const normalizedAdmissionNumber =
            normalizeAdmissionNumber(admissionNumber);

        const existingAdmission =
            await Admission.findOne({
                admissionNumber:
                    normalizedAdmissionNumber
            });

        if (existingAdmission) {
            return res.status(409).json({
                success: false,
                message:
                    "An admission with this admission number already exists."
            });
        }

        // Verify patient
        const patientExists =
            await Patient.findById(patient);

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        // Validate doctor
        if (
            attendingDoctor &&
            !validateObjectId(attendingDoctor)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid attending doctor ID."
            });
        }

        // Validate department
        if (
            department &&
            !validateObjectId(department)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID."
            });
        }

        // Verify doctor
        if (attendingDoctor) {
            const doctorExists =
                await Doctor.findById(attendingDoctor);

            if (!doctorExists) {
                return res.status(404).json({
                    success: false,
                    message: "Attending doctor not found."
                });
            }
        }

        // Verify department
        if (department) {
            const departmentExists =
                await Department.findById(department);

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        // Validate discharge date
        if (
            expectedDischargeDate &&
            admissionDate &&
            new Date(expectedDischargeDate) <
                new Date(admissionDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Expected discharge date cannot be before admission date."
            });
        }

        // Create admission
        const admission =
            await Admission.create({
                admissionNumber:
                    normalizedAdmissionNumber,

                patient,

                attendingDoctor:
                    attendingDoctor || null,

                department:
                    department || null,

                admissionDate:
                    admissionDate || new Date(),

                expectedDischargeDate:
                    expectedDischargeDate || null,

                admissionType:
                    admissionType || "routine",

                priority:
                    priority || "normal",

                reason:
                    String(reason).trim(),

                diagnosis:
                    diagnosis || "",

                symptoms:
                    symptoms || "",

                roomNumber:
                    roomNumber || "",

                bedNumber:
                    bedNumber || "",

                ward:
                    ward || "",

                status:
                    status || "admitted",

                notes:
                    notes || "",

                createdBy:
                    req.user?.id || null,

                updatedBy:
                    req.user?.id || null
            });

        const populatedAdmission =
            await populateAdmission(
                Admission.findById(admission._id)
            );

        return res.status(201).json({
            success: true,
            message: "Admission created successfully.",
            data: populatedAdmission
        });
    } catch (error) {
        console.error(
            "Create admission error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An admission with this admission number already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create admission.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

/*
|--------------------------------------------------------------------------
| PUT /api/admissions/:id
|--------------------------------------------------------------------------
*/

const updateAdmission = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        const admission =
            await Admission.findById(id);

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: "Admission not found."
            });
        }

        const allowedFields = [
            "admissionNumber",
            "patient",
            "attendingDoctor",
            "department",
            "admissionDate",
            "expectedDischargeDate",
            "actualDischargeDate",
            "admissionType",
            "priority",
            "reason",
            "diagnosis",
            "symptoms",
            "roomNumber",
            "bedNumber",
            "ward",
            "status",
            "dischargeSummary",
            "notes"
        ];

        allowedFields.forEach((field) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                admission[field] =
                    req.body[field];
            }
        });

        // Normalize admission number
        if (admission.admissionNumber) {
            admission.admissionNumber =
                normalizeAdmissionNumber(
                    admission.admissionNumber
                );
        }

        // Validate patient
        if (
            admission.patient &&
            !validateObjectId(admission.patient)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        const patientExists =
            await Patient.findById(
                admission.patient
            );

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        // Validate doctor
        if (
            admission.attendingDoctor &&
            !validateObjectId(
                admission.attendingDoctor
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attending doctor ID."
            });
        }

        // Verify doctor
        if (admission.attendingDoctor) {
            const doctorExists =
                await Doctor.findById(
                    admission.attendingDoctor
                );

            if (!doctorExists) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Attending doctor not found."
                });
            }
        }

        // Validate department
        if (
            admission.department &&
            !validateObjectId(
                admission.department
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID."
            });
        }

        // Verify department
        if (admission.department) {
            const departmentExists =
                await Department.findById(
                    admission.department
                );

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Department not found."
                });
            }
        }

        // Validate discharge date
        if (
            admission.expectedDischargeDate &&
            admission.admissionDate &&
            new Date(
                admission.expectedDischargeDate
            ) <
                new Date(
                    admission.admissionDate
                )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Expected discharge date cannot be before admission date."
            });
        }

        // Automatically set actual discharge date
        if (
            admission.status === "discharged" &&
            !admission.actualDischargeDate
        ) {
            admission.actualDischargeDate =
                new Date();
        }

        admission.updatedBy =
            req.user?.id ||
            admission.updatedBy ||
            null;

        await admission.save();

        const populatedAdmission =
            await populateAdmission(
                Admission.findById(admission._id)
            );

        return res.status(200).json({
            success: true,
            message:
                "Admission updated successfully.",
            data: populatedAdmission
        });
    } catch (error) {
        console.error(
            "Update admission error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An admission with this admission number already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to update admission.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/admissions/:id
|--------------------------------------------------------------------------
*/

const deleteAdmission = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        const admission =
            await Admission.findById(id);

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: "Admission not found."
            });
        }

        await admission.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "Admission deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete admission error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete admission.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/admissions/summary
|--------------------------------------------------------------------------
*/

const getAdmissionSummary = async (req, res) => {
    try {
        const [
            total,
            admitted,
            observation,
            discharged,
            transferred,
            emergency,
            critical
        ] = await Promise.all([
            Admission.countDocuments(),

            Admission.countDocuments({
                status: "admitted"
            }),

            Admission.countDocuments({
                status: "observation"
            }),

            Admission.countDocuments({
                status: "discharged"
            }),

            Admission.countDocuments({
                status: "transferred"
            }),

            Admission.countDocuments({
                admissionType: "emergency",
                status: {
                    $nin: [
                        "discharged",
                        "cancelled"
                    ]
                }
            }),

            Admission.countDocuments({
                priority: "critical",
                status: {
                    $nin: [
                        "discharged",
                        "cancelled"
                    ]
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                admitted,
                observation,
                discharged,
                transferred,
                emergency,
                critical
            }
        });
    } catch (error) {
        console.error(
            "Get admission summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve admission summary.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

module.exports = {
    getAdmissions,
    getAdmission,
    createAdmission,
    updateAdmission,
    deleteAdmission,
    getAdmissionSummary
};