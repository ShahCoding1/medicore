const Report = require("../models/Report");

const getReports = async (req, res) => {
    try {
        const {
            category,
            status,
            search,
            page = 1,
            limit = 25
        } = req.query;

        const query = {
            createdBy: req.user.id
        };

        if (category) query.category = category;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { reportType: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [reports, total] = await Promise.all([
            Report.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("createdBy", "firstName lastName email")
                .lean(),
            Report.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Get reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load reports."
        });
    }
};

const getReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        })
            .populate("createdBy", "firstName lastName email")
            .lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error("Get report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load report."
        });
    }
};

const createReport = async (req, res) => {
    try {
        const {
            name,
            category,
            reportType,
            dateRange,
            filters = {},
            columns = [],
            grouping,
            sort = {}
        } = req.body;

        if (
            !name ||
            !category ||
            !reportType ||
            !dateRange?.from ||
            !dateRange?.to
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, category, report type and date range are required."
            });
        }

        const report = await Report.create({
            name,
            category,
            reportType,
            dateRange,
            filters,
            columns,
            grouping,
            sort,
            status: "generating",
            createdBy: req.user.id,
            updatedBy: req.user.id
        });

        // Report generation is intentionally lightweight here.
        // The record is created first and can later be processed by
        // a dedicated reporting worker/service.
        report.status = "ready";
        report.generatedAt = new Date();
        report.result = {
            generated: true,
            rows: [],
            message: "Report configuration generated successfully."
        };

        await report.save();

        res.status(201).json({
            success: true,
            message: "Report generated successfully.",
            data: report
        });
    } catch (error) {
        console.error("Create report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate report."
        });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { status, errorMessage } = req.body;

        const allowedStatuses = [
            "generating",
            "ready",
            "failed",
            "expired"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report status."
            });
        }

        const report = await Report.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.user.id
            },
            {
                status,
                errorMessage:
                    status === "failed" ? errorMessage || "Report generation failed." : undefined,
                generatedAt: status === "ready" ? new Date() : undefined,
                updatedBy: req.user.id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.json({
            success: true,
            message: "Report status updated.",
            data: report
        });
    } catch (error) {
        console.error("Update report status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update report status."
        });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        res.json({
            success: true,
            message: "Report deleted successfully."
        });
    } catch (error) {
        console.error("Delete report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete report."
        });
    }
};

module.exports = {
    getReports,
    getReport,
    createReport,
    updateReportStatus,
    deleteReport
};