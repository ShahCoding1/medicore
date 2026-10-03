const mongoose = require("mongoose");

const Role = require("../models/Role");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeKey = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

const normalizePermissions = (permissions) => {
    if (!Array.isArray(permissions)) {
        return [];
    }

    return [
        ...new Set(
            permissions
                .map((permission) => String(permission || "").trim())
                .filter(Boolean)
        )
    ];
};

const getRoles = async (req, res) => {
    try {
        const {
            search = "",
            status = "",
            page = 1,
            limit = 100
        } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.min(
            Math.max(Number(limit) || 100, 1),
            200
        );

        const query = {};

        if (status === "active") {
            query.isActive = true;
        }

        if (status === "inactive") {
            query.isActive = false;
        }

        if (search.trim()) {
            const regex = new RegExp(search.trim(), "i");

            query.$or = [
                { name: regex },
                { key: regex },
                { description: regex },
                { permissions: regex }
            ];
        }

        const skip = (currentPage - 1) * pageLimit;

        const [roles, total] = await Promise.all([
            Role.find(query)
                .populate("createdBy", "firstName lastName email")
                .populate("updatedBy", "firstName lastName email")
                .sort({ isSystemRole: -1, name: 1 })
                .skip(skip)
                .limit(pageLimit)
                .lean(),

            Role.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: roles,
            pagination: {
                total,
                page: currentPage,
                limit: pageLimit,
                pages: Math.ceil(total / pageLimit)
            }
        });
    } catch (error) {
        console.error("Get roles error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load roles."
        });
    }
};

const getRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID."
            });
        }

        const role = await Role.findById(id)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error("Get role error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load role."
        });
    }
};

const createRole = async (req, res) => {
    try {
        const {
            name,
            key,
            description,
            permissions,
            isActive
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({
                success: false,
                message: "Role name is required."
            });
        }

        const normalizedKey = normalizeKey(key || name);

        if (!normalizedKey) {
            return res.status(400).json({
                success: false,
                message: "A valid role key is required."
            });
        }

        const existingRole = await Role.findOne({
            key: normalizedKey
        });

        if (existingRole) {
            return res.status(409).json({
                success: false,
                message: "A role with this key already exists."
            });
        }

        const role = await Role.create({
            name: String(name).trim(),
            key: normalizedKey,
            description: description?.trim() || "",
            permissions: normalizePermissions(permissions),
            isActive:
                typeof isActive === "boolean"
                    ? isActive
                    : true,
            isSystemRole: false,
            createdBy: req.user?.id
        });

        const populatedRole = await Role.findById(role._id)
            .populate("createdBy", "firstName lastName email");

        return res.status(201).json({
            success: true,
            message: "Role created successfully.",
            data: populatedRole
        });
    } catch (error) {
        console.error("Create role error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A role with this key already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((item) => item.message)
                    .join(" ")
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create role."
        });
    }
};

const updateRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID."
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole && req.body.key) {
            return res.status(400).json({
                success: false,
                message: "System role keys cannot be changed."
            });
        }

        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim();

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Role name cannot be empty."
                });
            }

            role.name = name;
        }

        if (req.body.key !== undefined && !role.isSystemRole) {
            const normalizedKey = normalizeKey(req.body.key);

            if (!normalizedKey) {
                return res.status(400).json({
                    success: false,
                    message: "A valid role key is required."
                });
            }

            const duplicate = await Role.findOne({
                key: normalizedKey,
                _id: { $ne: role._id }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "A role with this key already exists."
                });
            }

            role.key = normalizedKey;
        }

        if (req.body.description !== undefined) {
            role.description =
                String(req.body.description || "").trim();
        }

        if (req.body.permissions !== undefined) {
            role.permissions =
                normalizePermissions(req.body.permissions);
        }

        if (typeof req.body.isActive === "boolean") {
            role.isActive = req.body.isActive;
        }

        role.updatedBy = req.user?.id;

        await role.save();

        const populatedRole = await Role.findById(role._id)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Role updated successfully.",
            data: populatedRole
        });
    } catch (error) {
        console.error("Update role error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A role with this key already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((item) => item.message)
                    .join(" ")
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update role."
        });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role ID."
            });
        }

        const role = await Role.findById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found."
            });
        }

        if (role.isSystemRole) {
            return res.status(400).json({
                success: false,
                message: "System roles cannot be deleted."
            });
        }

        await role.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully."
        });
    } catch (error) {
        console.error("Delete role error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete role."
        });
    }
};

const getRoleSummary = async (req, res) => {
    try {
        const [
            total,
            active,
            inactive,
            systemRoles,
            customRoles
        ] = await Promise.all([
            Role.countDocuments(),
            Role.countDocuments({ isActive: true }),
            Role.countDocuments({ isActive: false }),
            Role.countDocuments({ isSystemRole: true }),
            Role.countDocuments({ isSystemRole: false })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                active,
                inactive,
                systemRoles,
                customRoles
            }
        });
    } catch (error) {
        console.error("Get role summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load role summary."
        });
    }
};

module.exports = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getRoleSummary
};