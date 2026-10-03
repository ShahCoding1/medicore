const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
    try {
        const {
            user,
            module,
            action,
            status,
            from,
            to,
            search,
            page = 1,
            limit = 25
        } = req.query;

        const query = {};

        if (user) {
            query.actor = user;
        }

        if (module) {
            query.module = module;
        }

        if (action) {
            query.action = action;
        }

        if (status) {
            query.status = status;
        }

        if (from || to) {
            query.createdAt = {};

            if (from) {
                query.createdAt.$gte = new Date(from);
            }

            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }

        if (search) {
            query.$or = [
                { module: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } },
                { target: { $regex: search, $options: "i" } },
                { targetType: { $regex: search, $options: "i" } }
            ];
        }

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const skip = (pageNumber - 1) * limitNumber;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate(
                    "actor",
                    "firstName lastName email role"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            AuditLog.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        console.error("Get audit logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load audit logs."
        });
    }
};

const getAuditLog = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id)
            .populate(
                "actor",
                "firstName lastName email role"
            )
            .lean();

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found."
            });
        }

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error("Get audit log error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load audit log."
        });
    }
};

const createAuditLog = async (req, res) => {
    try {
        const {
            module,
            action,
            targetType,
            targetId,
            target,
            status = "success",
            previousState,
            newState,
            metadata
        } = req.body;

        if (!module || !action) {
            return res.status(400).json({
                success: false,
                message: "Module and action are required."
            });
        }

        const auditLog = await AuditLog.create({
            actor: req.user.id,
            module,
            action,
            targetType,
            targetId,
            target,
            status,
            ipAddress:
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
            previousState:
                previousState ?? null,
            newState:
                newState ?? null,
            metadata: metadata || {}
        });

        res.status(201).json({
            success: true,
            message: "Audit log created successfully.",
            data: auditLog
        });
    } catch (error) {
        console.error("Create audit log error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create audit log."
        });
    }
};

const getAuditSummary = async (req, res) => {
    try {
        const [
            total,
            successful,
            failed,
            warnings
        ] = await Promise.all([
            AuditLog.countDocuments(),
            AuditLog.countDocuments({
                status: "success"
            }),
            AuditLog.countDocuments({
                status: "failed"
            }),
            AuditLog.countDocuments({
                status: "warning"
            })
        ]);

        res.json({
            success: true,
            data: {
                total,
                successful,
                failed,
                warnings
            }
        });
    } catch (error) {
        console.error(
            "Get audit summary error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load audit summary."
        });
    }
};

module.exports = {
    getAuditLogs,
    getAuditLog,
    createAuditLog,
    getAuditSummary
};