const Department = require("../models/Department");
const Hospital = require("../models/Hospital");

const getHospitalForUser = async (userId) => {
    return Hospital.findOne({
        owner: userId
    });
};

// ==========================================
// GET DEPARTMENTS
// ==========================================

const getDepartments = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(
            req.user.id
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const {
            search = "",
            status = ""
        } = req.query;

        const filter = {
            hospital: hospital._id
        };

        if (status) {
            filter.status = status;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                {
                    name: searchRegex
                },
                {
                    code: searchRegex
                },
                {
                    description: searchRegex
                },
                {
                    location: searchRegex
                }
            ];
        }

        const departments = await Department.find(filter)
            .populate(
                "headOfDepartment",
                "firstName lastName specialization"
            )
            .sort({
                name: 1
            });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET SINGLE DEPARTMENT
// ==========================================

const getDepartmentById = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(
            req.user.id
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const department =
            await Department.findOne({
                _id: req.params.id,
                hospital: hospital._id
            }).populate(
                "headOfDepartment",
                "firstName lastName specialization"
            );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// CREATE DEPARTMENT
// ==========================================

const createDepartment = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(
            req.user.id
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const {
            name,
            code,
            description,
            headOfDepartment,
            phone,
            location,
            status
        } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message:
                    "Department name and code are required."
            });
        }

        const normalizedName = name.trim();
        const normalizedCode = code
            .trim()
            .toUpperCase();

        const existingDepartment =
            await Department.findOne({
                hospital: hospital._id,
                $or: [
                    {
                        name: normalizedName
                    },
                    {
                        code: normalizedCode
                    }
                ]
            });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message:
                    "A department with this name or code already exists."
            });
        }

        const department =
            await Department.create({
                hospital: hospital._id,
                name: normalizedName,
                code: normalizedCode,
                description:
                    description?.trim() || "",
                headOfDepartment:
                    headOfDepartment || null,
                phone:
                    phone?.trim() || "",
                location:
                    location?.trim() || "",
                status:
                    status || "active"
            });

        res.status(201).json({
            success: true,
            message:
                "Department created successfully.",
            data: department
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// UPDATE DEPARTMENT
// ==========================================

const updateDepartment = async (req, res, next) => {
    try {
        const hospital = await getHospitalForUser(
            req.user.id
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const department =
            await Department.findOne({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        const allowedFields = [
            "name",
            "code",
            "description",
            "headOfDepartment",
            "phone",
            "location",
            "status"
        ];

        allowedFields.forEach((field) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                department[field] =
                    req.body[field];
            }
        });

        if (department.name) {
            department.name =
                department.name.trim();
        }

        if (department.code) {
            department.code =
                department.code
                    .trim()
                    .toUpperCase();
        }

        await department.save();

        res.status(200).json({
            success: true,
            message:
                "Department updated successfully.",
            data: department
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// DELETE DEPARTMENT
// ==========================================

const deleteDepartment = async (
    req,
    res,
    next
) => {
    try {
        const hospital = await getHospitalForUser(
            req.user.id
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital workspace not found."
            });
        }

        const department =
            await Department.findOneAndDelete({
                _id: req.params.id,
                hospital: hospital._id
            });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        res.status(200).json({
            success: true,
            message:
                "Department deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};