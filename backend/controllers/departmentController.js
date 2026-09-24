const Hospital = require("../models/Hospital");
const Department = require("../models/Department");

const createDepartments = async (req, res, next) => {
    try {
        const { departments } = req.body;

        if (
            !Array.isArray(departments) ||
            departments.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please add at least one department."
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

        const cleanedDepartments = departments
            .map((department) => ({
                name: department.name?.trim(),
                type: department.type,
                head: department.head?.trim() || ""
            }))
            .filter(
                (department) =>
                    department.name && department.type
            );

        if (cleanedDepartments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid department information."
            });
        }

        const names = cleanedDepartments.map(
            (department) => department.name.toLowerCase()
        );

        if (new Set(names).size !== names.length) {
            return res.status(400).json({
                success: false,
                message: "Department names must be unique."
            });
        }

        await Department.deleteMany({
            hospital: hospital._id
        });

        const createdDepartments =
            await Department.insertMany(
                cleanedDepartments.map((department) => ({
                    hospital: hospital._id,
                    ...department
                }))
            );

        return res.status(201).json({
            success: true,
            message: "Departments saved successfully.",
            data: {
                departments: createdDepartments
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A department with this name already exists."
            });
        }

        next(error);
    }
};

module.exports = {
    createDepartments
};