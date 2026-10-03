const mongoose = require("mongoose");

const Staff = require("../models/Staff");
const Department = require("../models/Department");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function normalizeEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}

function buildSearchFilter(search) {
    if (!search) {
        return {};
    }

    const regex = new RegExp(search, "i");

    return {
        $or: [
            { employeeId: regex },
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { phone: regex },
            { role: regex },
            { professionalTitle: regex },
            { specialization: regex }
        ]
    };
}

async function populateStaff(query) {
    return query
        .populate(
            "department",
            "name code description"
        )
        .populate(
            "createdBy",
            "firstName lastName email"
        )
        .populate(
            "updatedBy",
            "firstName lastName email"
        );
}

const getStaff = async (req, res) => {
    try {
        const {
            search,
            role,
            department,
            status,
            employmentType,
            dateFrom,
            dateTo,
            page = 1,
            limit = 20
        } = req.query;

        const filters = {
            ...buildSearchFilter(search)
        };

        if (role) {
            filters.role = role;
        }

        if (department) {
            if (!isValidObjectId(department)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID."
                });
            }

            filters.department = department;
        }

        if (status) {
            filters.status = status;
        }

        if (employmentType) {
            filters.employmentType =
                employmentType;
        }

        if (dateFrom || dateTo) {
            filters.joiningDate = {};

            if (dateFrom) {
                const startDate = new Date(dateFrom);

                if (Number.isNaN(startDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid start date."
                    });
                }

                startDate.setHours(0, 0, 0, 0);

                filters.joiningDate.$gte =
                    startDate;
            }

            if (dateTo) {
                const endDate = new Date(dateTo);

                if (Number.isNaN(endDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid end date."
                    });
                }

                endDate.setHours(
                    23,
                    59,
                    59,
                    999
                );

                filters.joiningDate.$lte =
                    endDate;
            }
        }

        const currentPage =
            Math.max(Number(page) || 1, 1);

        const pageSize = Math.min(
            Math.max(Number(limit) || 20, 1),
            100
        );

        const skip =
            (currentPage - 1) * pageSize;

        const [staff, total] =
            await Promise.all([
                populateStaff(
                    Staff.find(filters)
                        .sort({
                            createdAt: -1,
                            lastName: 1
                        })
                        .skip(skip)
                        .limit(pageSize)
                ),
                Staff.countDocuments(filters)
            ]);

        return res.status(200).json({
            success: true,
            data: staff,
            pagination: {
                total,
                page: currentPage,
                limit: pageSize,
                pages: Math.ceil(
                    total / pageSize
                )
            }
        });
    } catch (error) {
        console.error(
            "Get staff error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve staff records."
        });
    }
};

const getStaffMember = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID."
            });
        }

        const staff = await populateStaff(
            Staff.findById(id)
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        console.error(
            "Get staff member error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve staff member."
        });
    }
};

const createStaff = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            photo,
            role,
            department,
            professionalTitle,
            qualification,
            specialization,
            employmentType,
            joiningDate,
            status,
            schedule,
            permissions,
            activity,
            securityNotes,
            lastActive,
            notes
        } = req.body;

        if (!firstName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "First name is required."
            });
        }

        if (!lastName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Last name is required."
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        if (!role?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Role is required."
            });
        }

        const normalizedEmail =
            normalizeEmail(email);

        const existingStaff =
            await Staff.findOne({
                email: normalizedEmail
            });

        if (existingStaff) {
            return res.status(409).json({
                success: false,
                message:
                    "A staff member with this email already exists."
            });
        }

        if (
            department &&
            !isValidObjectId(department)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID."
            });
        }

        if (department) {
            const departmentExists =
                await Department.exists({
                    _id: department
                });

            if (!departmentExists) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }
        }

        const staff = await Staff.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone,
            photo,
            role: role.trim(),
            department:
                department || undefined,
            professionalTitle,
            qualification,
            specialization,
            employmentType,
            joiningDate,
            status,
            schedule,
            permissions,
            activity,
            securityNotes,
            lastActive,
            notes,
            createdBy: req.user?.id
        });

        const populatedStaff =
            await populateStaff(
                Staff.findById(staff._id)
            );

        return res.status(201).json({
            success: true,
            message:
                "Staff member created successfully.",
            data: populatedStaff
        });
    } catch (error) {
        console.error(
            "Create staff error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A staff member with this information already exists."
            });
        }

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    Object.values(error.errors)
                        .map(
                            (item) =>
                                item.message
                        )
                        .join(" ")
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create staff member."
        });
    }
};

const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID."
            });
        }

        const staff =
            await Staff.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        const allowedFields = [
            "firstName",
            "lastName",
            "email",
            "phone",
            "photo",
            "role",
            "department",
            "professionalTitle",
            "qualification",
            "specialization",
            "employmentType",
            "joiningDate",
            "status",
            "schedule",
            "permissions",
            "activity",
            "securityNotes",
            "lastActive",
            "notes"
        ];

        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                staff[field] =
                    req.body[field];
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                req.body,
                "email"
            )
        ) {
            staff.email =
                normalizeEmail(
                    req.body.email
                );

            const duplicate =
                await Staff.findOne({
                    email: staff.email,
                    _id: {
                        $ne: staff._id
                    }
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another staff member already uses this email."
                });
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                req.body,
                "department"
            )
        ) {
            if (
                req.body.department &&
                !isValidObjectId(
                    req.body.department
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid department ID."
                });
            }

            if (req.body.department) {
                const departmentExists =
                    await Department.exists({
                        _id:
                            req.body.department
                    });

                if (!departmentExists) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Department not found."
                    });
                }
            }

            staff.department =
                req.body.department ||
                undefined;
        }

        if (!staff.firstName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "First name is required."
            });
        }

        if (!staff.lastName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Last name is required."
            });
        }

        if (!staff.email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        if (!staff.role?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Role is required."
            });
        }

        staff.updatedBy = req.user?.id;

        await staff.save();

        const populatedStaff =
            await populateStaff(
                Staff.findById(staff._id)
            );

        return res.status(200).json({
            success: true,
            message:
                "Staff member updated successfully.",
            data: populatedStaff
        });
    } catch (error) {
        console.error(
            "Update staff error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "A staff member with this information already exists."
            });
        }

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    Object.values(error.errors)
                        .map(
                            (item) =>
                                item.message
                        )
                        .join(" ")
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to update staff member."
        });
    }
};

const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid staff ID."
            });
        }

        const staff =
            await Staff.findById(id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found."
            });
        }

        await staff.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "Staff member deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete staff error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete staff member."
        });
    }
};

const getStaffSummary = async (req, res) => {
    try {
        const [
            total,
            active,
            inactive,
            onLeave,
            suspended
        ] = await Promise.all([
            Staff.countDocuments(),
            Staff.countDocuments({
                status: "active"
            }),
            Staff.countDocuments({
                status: "inactive"
            }),
            Staff.countDocuments({
                status: "on_leave"
            }),
            Staff.countDocuments({
                status: "suspended"
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                active,
                inactive,
                onLeave,
                suspended
            }
        });
    } catch (error) {
        console.error(
            "Staff summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve staff summary."
        });
    }
};

module.exports = {
    getStaff,
    getStaffMember,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffSummary
};