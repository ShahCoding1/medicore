const Patient = require("../models/Patient");
const Hospital = require("../models/Hospital");

const getHospitalForUser = async (userId) => {
    return Hospital.findOne({
        owner: userId
    });
};

// GET /api/patients
const getPatients = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const {
            search = "",
            status = "",
            department = ""
        } = req.query;

        const query = {
            hospital: hospital._id
        };

        if (status) {
            query.status = status;
        }

        if (department) {
            query.department = department;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            query.$or = [
                {
                    firstName: searchRegex
                },
                {
                    lastName: searchRegex
                },
                {
                    patientId: searchRegex
                },
                {
                    phone: searchRegex
                }
            ];
        }

        const patients = await Patient.find(query)
            .populate("department", "name")
            .sort({
                createdAt: -1
            })
            .lean();

        res.status(200).json({
            success: true,
            data: patients
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/patients/:id
const getPatientById = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const patient = await Patient.findOne({
            _id: req.params.id,
            hospital: hospital._id
        })
            .populate("department", "name")
            .lean();

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/patients
const createPatient = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const {
            patientId,
            firstName,
            lastName,
            phone,
            gender,
            dateOfBirth,
            department
        } = req.body;

        if (
            !patientId ||
            !firstName ||
            !lastName
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient ID, first name and last name are required."
            });
        }

        const existingPatient =
            await Patient.findOne({
                hospital: hospital._id,
                patientId: patientId.trim()
            });

        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message:
                    "A patient with this Patient ID already exists."
            });
        }

        const patient = await Patient.create({
            hospital: hospital._id,
            patientId: patientId.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone?.trim() || "",
            gender: gender || "other",
            dateOfBirth: dateOfBirth || null,
            department: department || null
        });

        const populatedPatient =
            await Patient.findById(patient._id)
                .populate("department", "name")
                .lean();

        res.status(201).json({
            success: true,
            message: "Patient created successfully.",
            data: populatedPatient
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/patients/:id
const updatePatient = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const allowedFields = [
            "firstName",
            "lastName",
            "phone",
            "gender",
            "dateOfBirth",
            "department",
            "status"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (
                req.body[field] !== undefined
            ) {
                updates[field] =
                    req.body[field];
            }
        });

        if (updates.firstName) {
            updates.firstName =
                updates.firstName.trim();
        }

        if (updates.lastName) {
            updates.lastName =
                updates.lastName.trim();
        }

        if (updates.phone) {
            updates.phone =
                updates.phone.trim();
        }

        const patient =
            await Patient.findOneAndUpdate(
                {
                    _id: req.params.id,
                    hospital: hospital._id
                },
                updates,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "department",
                    "name"
                )
                .lean();

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Patient updated successfully.",
            data: patient
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const patient =
            await Patient.findOneAndDelete({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Patient deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};