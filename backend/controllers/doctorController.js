const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const getHospitalForUser = async (userId) => {
    return Hospital.findOne({ owner: userId });
};


// ==========================================
// GET DOCTORS
// ==========================================

const getDoctors = async (req, res) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
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
            const regex = new RegExp(search.trim(), "i");

            query.$or = [
                { doctorId: regex },
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { phone: regex },
                { specialization: regex },
                { licenseNumber: regex }
            ];
        }

        const doctors = await Doctor.find(query)
            .populate("department", "name")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });

    } catch (error) {
        console.error("Get doctors error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctors."
        });
    }
};


// ==========================================
// GET SINGLE DOCTOR
// ==========================================

const getDoctorById = async (req, res) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const doctor = await Doctor.findOne({
            _id: req.params.id,
            hospital: hospital._id
        }).populate("department", "name");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: doctor
        });

    } catch (error) {
        console.error("Get doctor error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctor."
        });
    }
};


// ==========================================
// CREATE DOCTOR
// ==========================================

const createDoctor = async (req, res) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const {
            doctorId,
            firstName,
            lastName,
            email,
            phone,
            specialization,
            licenseNumber,
            department,
            gender,
            status
        } = req.body;

        if (!doctorId || !firstName || !lastName || !specialization) {
            return res.status(400).json({
                success: false,
                message:
                    "Doctor ID, first name, last name and specialization are required."
            });
        }

        const existingDoctor = await Doctor.findOne({
            hospital: hospital._id,
            doctorId
        });

        if (existingDoctor) {
            return res.status(409).json({
                success: false,
                message: "Doctor ID already exists."
            });
        }

        const doctor = await Doctor.create({
            hospital: hospital._id,
            doctorId,
            firstName,
            lastName,
            email,
            phone,
            specialization,
            licenseNumber,
            department: department || null,
            gender,
            status
        });

        const populatedDoctor =
            await Doctor.findById(doctor._id)
                .populate("department", "name");

        return res.status(201).json({
            success: true,
            message: "Doctor created successfully.",
            data: populatedDoctor
        });

    } catch (error) {
        console.error("Create doctor error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create doctor."
        });
    }
};


// ==========================================
// UPDATE DOCTOR
// ==========================================

const updateDoctor = async (req, res) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const allowedFields = [
            "firstName",
            "lastName",
            "email",
            "phone",
            "specialization",
            "licenseNumber",
            "department",
            "gender",
            "status"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] =
                    req.body[field] === ""
                        ? null
                        : req.body[field];
            }
        });

        const doctor = await Doctor.findOneAndUpdate(
            {
                _id: req.params.id,
                hospital: hospital._id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate("department", "name");

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully.",
            data: doctor
        });

    } catch (error) {
        console.error("Update doctor error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update doctor."
        });
    }
};


// ==========================================
// DELETE DOCTOR
// ==========================================

const deleteDoctor = async (req, res) => {
    try {
        const hospital = await getHospitalForUser(req.user.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const doctor = await Doctor.findOneAndDelete({
            _id: req.params.id,
            hospital: hospital._id
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Doctor deleted successfully."
        });

    } catch (error) {
        console.error("Delete doctor error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete doctor."
        });
    }
};


module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
};