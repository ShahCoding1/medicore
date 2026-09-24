const Hospital = require("../models/Hospital");
const Department = require("../models/Department");
const Staff = require("../models/Staff");

const createStaff = async (req, res, next) => {
    try {
        const { staff } = req.body;

        if (!Array.isArray(staff) || staff.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please add at least one staff member."
            });
        }

        const hospital = await Hospital.findOne({
            owner: req.user.id
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup has not been completed."
            });
        }

        const departments = await Department.find({
            hospital: hospital._id,
            status: "active"
        });

        const departmentIds = new Set(
            departments.map(
                (department) => department._id.toString()
            )
        );

        const cleanedStaff = staff
            .map((member) => ({
                firstName: member.firstName?.trim(),
                lastName: member.lastName?.trim(),
                email: member.email?.trim().toLowerCase() || "",
                phone: member.phone?.trim() || "",
                role: member.role,
                department:
                    member.department || null
            }))
            .filter(
                (member) =>
                    member.firstName &&
                    member.lastName &&
                    member.role
            );

        if (cleanedStaff.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid staff information."
            });
        }

        for (const member of cleanedStaff) {
            if (
                member.department &&
                !departmentIds.has(
                    member.department.toString()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more selected departments are invalid."
                });
            }
        }

        await Staff.deleteMany({
            hospital: hospital._id
        });

        const createdStaff = await Staff.insertMany(
            cleanedStaff.map((member) => ({
                hospital: hospital._id,
                ...member
            }))
        );

        return res.status(201).json({
            success: true,
            message: "Staff saved successfully.",
            data: {
                staff: createdStaff
            }
        });
    } catch (error) {
        next(error);
    }
};

const getOnboardingStaffData = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({
            owner: req.user.id
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup has not been completed."
            });
        }

        const departments = await Department.find({
            hospital: hospital._id,
            status: "active"
        }).select("_id name type");

        return res.status(200).json({
            success: true,
            data: {
                departments
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStaff,
    getOnboardingStaffData
};