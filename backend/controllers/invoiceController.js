const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Patient = require("../models/Patient");

// ==========================================
// HELPERS
// ==========================================

const getUserId = (req) => {
    return req.user?.id || req.user?._id || null;
};

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const roundMoney = (value) => {
    return Math.round((Number(value) || 0) * 100) / 100;
};

const normalizeInvoiceNumber = (value) => {
    return String(value || "")
        .trim()
        .toUpperCase();
};

const normalizeStatus = (value) => {
    const allowedStatuses = [
        "draft",
        "unpaid",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled"
    ];

    const status = String(value || "")
        .trim()
        .toLowerCase();

    return allowedStatuses.includes(status)
        ? status
        : null;
};

const normalizePaymentMethod = (value) => {
    const allowedMethods = [
        "cash",
        "card",
        "bank_transfer",
        "online",
        "insurance",
        "other"
    ];

    const method = String(value || "")
        .trim()
        .toLowerCase();

    return allowedMethods.includes(method)
        ? method
        : null;
};

const buildInvoiceItems = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .map((item) => {
            const description = String(
                item?.description || ""
            ).trim();

            const quantity = Number(
                item?.quantity
            );

            const unitPrice = Number(
                item?.unitPrice
            );

            return {
                description,
                quantity,
                unitPrice,
                amount: roundMoney(
                    quantity * unitPrice
                )
            };
        })
        .filter((item) => {
            return (
                item.description &&
                Number.isFinite(item.quantity) &&
                item.quantity >= 1 &&
                Number.isFinite(item.unitPrice) &&
                item.unitPrice >= 0
            );
        });
};

// ==========================================
// GET ALL INVOICES
// ==========================================

const getInvoices = async (req, res) => {
    try {
        const {
            search = "",
            patient = "",
            status = "",
            paymentMethod = "",
            dateFrom = "",
            dateTo = "",
            page = 1,
            limit = 20
        } = req.query;

        const query = {};

        // --------------------------------------
        // Search
        // --------------------------------------

        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim().replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );

            query.$or = [
                {
                    invoiceNumber:
                        searchRegex
                }
            ];
        }

        // --------------------------------------
        // Patient filter
        // --------------------------------------

        if (patient) {
            if (!isValidObjectId(patient)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid patient ID."
                });
            }

            query.patient = patient;
        }

        // --------------------------------------
        // Status filter
        // --------------------------------------

        if (status) {
            const normalizedStatus =
                normalizeStatus(status);

            if (!normalizedStatus) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid invoice status."
                });
            }

            query.status =
                normalizedStatus;
        }

        // --------------------------------------
        // Payment method filter
        // --------------------------------------

        if (paymentMethod) {
            const normalizedMethod =
                normalizePaymentMethod(
                    paymentMethod
                );

            if (!normalizedMethod) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment method."
                });
            }

            query.paymentMethod =
                normalizedMethod;
        }

        // --------------------------------------
        // Date range
        // --------------------------------------

        if (dateFrom || dateTo) {
            query.invoiceDate = {};

            if (dateFrom) {
                const startDate =
                    new Date(dateFrom);

                if (
                    Number.isNaN(
                        startDate.getTime()
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid start date."
                    });
                }

                startDate.setHours(
                    0,
                    0,
                    0,
                    0
                );

                query.invoiceDate.$gte =
                    startDate;
            }

            if (dateTo) {
                const endDate =
                    new Date(dateTo);

                if (
                    Number.isNaN(
                        endDate.getTime()
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid end date."
                    });
                }

                endDate.setHours(
                    23,
                    59,
                    59,
                    999
                );

                query.invoiceDate.$lte =
                    endDate;
            }
        }

        // --------------------------------------
        // Pagination
        // --------------------------------------

        const currentPage = Math.max(
            1,
            Number(page) || 1
        );

        const currentLimit = Math.min(
            100,
            Math.max(
                1,
                Number(limit) || 20
            )
        );

        const skip =
            (currentPage - 1) *
            currentLimit;

        // --------------------------------------
        // Query
        // --------------------------------------

        const [
            invoices,
            total
        ] = await Promise.all([
            Invoice.find(query)
                .populate(
                    "patient",
                    "patientId firstName lastName email phone"
                )
                .populate(
                    "createdBy",
                    "name email role"
                )
                .sort({
                    invoiceDate: -1,
                    createdAt: -1
                })
                .skip(skip)
                .limit(currentLimit)
                .lean({
                    virtuals: true
                }),

            Invoice.countDocuments(
                query
            )
        ]);

        return res.status(200).json({
            success: true,
            invoices,
            pagination: {
                page: currentPage,
                limit: currentLimit,
                total,
                pages: Math.ceil(
                    total /
                        currentLimit
                )
            }
        });
    } catch (error) {
        console.error(
            "Get invoices error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve invoices."
        });
    }
};

// ==========================================
// GET SINGLE INVOICE
// ==========================================

const getInvoice = async (req, res) => {
    try {
        const { id } =
            req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID."
            });
        }

        const invoice =
            await Invoice.findById(id)
                .populate(
                    "patient",
                    "patientId firstName lastName email phone dateOfBirth gender"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        return res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error(
            "Get invoice error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve invoice."
        });
    }
};

// ==========================================
// CREATE INVOICE
// ==========================================

const createInvoice = async (req, res) => {
    try {
        const userId =
            getUserId(req);

        const {
            invoiceNumber,
            patient,
            invoiceDate,
            dueDate,
            items,
            discount = 0,
            tax = 0,
            paidAmount = 0,
            status,
            paymentMethod,
            notes = ""
        } = req.body;

        // --------------------------------------
        // Required fields
        // --------------------------------------

        if (!invoiceNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice number is required."
            });
        }

        if (!patient) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient is required."
            });
        }

        if (!isValidObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid patient ID."
            });
        }

        // --------------------------------------
        // Verify patient
        // --------------------------------------

        const patientExists =
            await Patient.exists({
                _id: patient
            });

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected patient was not found."
            });
        }

        // --------------------------------------
        // Invoice number
        // --------------------------------------

        const normalizedInvoiceNumber =
            normalizeInvoiceNumber(
                invoiceNumber
            );

        if (!normalizedInvoiceNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice number cannot be empty."
            });
        }

        const existingInvoice =
            await Invoice.findOne({
                invoiceNumber:
                    normalizedInvoiceNumber
            });

        if (existingInvoice) {
            return res.status(409).json({
                success: false,
                message:
                    "Invoice number already exists."
            });
        }

        // --------------------------------------
        // Items
        // --------------------------------------

        const normalizedItems =
            buildInvoiceItems(items);

        if (
            !normalizedItems.length
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one valid invoice item is required."
            });
        }

        // --------------------------------------
        // Financial values
        // --------------------------------------

        const normalizedDiscount =
            Number(discount);

        const normalizedTax =
            Number(tax);

        const normalizedPaidAmount =
            Number(paidAmount);

        if (
            !Number.isFinite(
                normalizedDiscount
            ) ||
            normalizedDiscount < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Discount must be a valid non-negative number."
            });
        }

        if (
            !Number.isFinite(
                normalizedTax
            ) ||
            normalizedTax < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tax must be a valid non-negative number."
            });
        }

        if (
            !Number.isFinite(
                normalizedPaidAmount
            ) ||
            normalizedPaidAmount < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Paid amount must be a valid non-negative number."
            });
        }

        // --------------------------------------
        // Dates
        // --------------------------------------

        let normalizedInvoiceDate =
            new Date();

        if (invoiceDate) {
            normalizedInvoiceDate =
                new Date(invoiceDate);

            if (
                Number.isNaN(
                    normalizedInvoiceDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid invoice date."
                });
            }
        }

        let normalizedDueDate =
            null;

        if (dueDate) {
            normalizedDueDate =
                new Date(dueDate);

            if (
                Number.isNaN(
                    normalizedDueDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid due date."
                });
            }
        }

        // --------------------------------------
        // Status / payment method
        // --------------------------------------

        let normalizedStatus =
            "unpaid";

        if (status) {
            normalizedStatus =
                normalizeStatus(status);

            if (!normalizedStatus) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid invoice status."
                });
            }
        }

        let normalizedPaymentMethod =
            "cash";

        if (paymentMethod) {
            normalizedPaymentMethod =
                normalizePaymentMethod(
                    paymentMethod
                );

            if (!normalizedPaymentMethod) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment method."
                });
            }
        }

        // --------------------------------------
        // Create invoice
        // --------------------------------------

        const invoice =
            await Invoice.create({
                invoiceNumber:
                    normalizedInvoiceNumber,

                patient,

                invoiceDate:
                    normalizedInvoiceDate,

                dueDate:
                    normalizedDueDate,

                items:
                    normalizedItems,

                discount:
                    roundMoney(
                        normalizedDiscount
                    ),

                tax:
                    roundMoney(
                        normalizedTax
                    ),

                paidAmount:
                    roundMoney(
                        normalizedPaidAmount
                    ),

                status:
                    normalizedStatus,

                paymentMethod:
                    normalizedPaymentMethod,

                notes:
                    String(notes || "")
                        .trim(),

                createdBy:
                    userId
            });

        const populatedInvoice =
            await Invoice.findById(
                invoice._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName email phone"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        return res.status(201).json({
            success: true,
            message:
                "Invoice created successfully.",
            invoice:
                populatedInvoice
        });
    } catch (error) {
        console.error(
            "Create invoice error:",
            error
        );

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Invoice number already exists."
            });
        }

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    Object.values(
                        error.errors
                    )
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
                "Failed to create invoice."
        });
    }
};

// ==========================================
// UPDATE INVOICE
// ==========================================

const updateInvoice = async (req, res) => {
    try {
        const { id } =
            req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID."
            });
        }

        const invoice =
            await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        const {
            invoiceNumber,
            patient,
            invoiceDate,
            dueDate,
            items,
            discount,
            tax,
            paidAmount,
            status,
            paymentMethod,
            notes
        } = req.body;

        // --------------------------------------
        // Invoice number
        // --------------------------------------

        if (
            invoiceNumber !==
            undefined
        ) {
            const normalizedInvoiceNumber =
                normalizeInvoiceNumber(
                    invoiceNumber
                );

            if (
                !normalizedInvoiceNumber
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invoice number cannot be empty."
                });
            }

            const duplicate =
                await Invoice.findOne({
                    invoiceNumber:
                        normalizedInvoiceNumber,
                    _id: {
                        $ne: id
                    }
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Invoice number already exists."
                });
            }

            invoice.invoiceNumber =
                normalizedInvoiceNumber;
        }

        // --------------------------------------
        // Patient
        // --------------------------------------

        if (
            patient !==
            undefined
        ) {
            if (
                !isValidObjectId(
                    patient
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid patient ID."
                });
            }

            const patientExists =
                await Patient.exists({
                    _id: patient
                });

            if (!patientExists) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected patient was not found."
                });
            }

            invoice.patient =
                patient;
        }

        // --------------------------------------
        // Items
        // --------------------------------------

        if (
            items !==
            undefined
        ) {
            const normalizedItems =
                buildInvoiceItems(items);

            if (
                !normalizedItems.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "At least one valid invoice item is required."
                });
            }

            invoice.items =
                normalizedItems;
        }

        // --------------------------------------
        // Invoice date
        // --------------------------------------

        if (
            invoiceDate !==
            undefined
        ) {
            const date =
                new Date(
                    invoiceDate
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid invoice date."
                });
            }

            invoice.invoiceDate =
                date;
        }

        // --------------------------------------
        // Due date
        // --------------------------------------

        if (
            dueDate !==
            undefined
        ) {
            if (
                dueDate ===
                    null ||
                dueDate ===
                    ""
            ) {
                invoice.dueDate =
                    null;
            } else {
                const date =
                    new Date(
                        dueDate
                    );

                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid due date."
                    });
                }

                invoice.dueDate =
                    date;
            }
        }

        // --------------------------------------
        // Discount
        // --------------------------------------

        if (
            discount !==
            undefined
        ) {
            const value =
                Number(discount);

            if (
                !Number.isFinite(
                    value
                ) ||
                value < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Discount must be a valid non-negative number."
                });
            }

            invoice.discount =
                roundMoney(value);
        }

        // --------------------------------------
        // Tax
        // --------------------------------------

        if (
            tax !==
            undefined
        ) {
            const value =
                Number(tax);

            if (
                !Number.isFinite(
                    value
                ) ||
                value < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Tax must be a valid non-negative number."
                });
            }

            invoice.tax =
                roundMoney(value);
        }

        // --------------------------------------
        // Paid amount
        // --------------------------------------

        if (
            paidAmount !==
            undefined
        ) {
            const value =
                Number(
                    paidAmount
                );

            if (
                !Number.isFinite(
                    value
                ) ||
                value < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Paid amount must be a valid non-negative number."
                });
            }

            invoice.paidAmount =
                roundMoney(value);
        }

        // --------------------------------------
        // Status
        // --------------------------------------

        if (
            status !==
            undefined
        ) {
            const normalizedStatus =
                normalizeStatus(
                    status
                );

            if (!normalizedStatus) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid invoice status."
                });
            }

            invoice.status =
                normalizedStatus;
        }

        // --------------------------------------
        // Payment method
        // --------------------------------------

        if (
            paymentMethod !==
            undefined
        ) {
            const normalizedMethod =
                normalizePaymentMethod(
                    paymentMethod
                );

            if (!normalizedMethod) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment method."
                });
            }

            invoice.paymentMethod =
                normalizedMethod;
        }

        // --------------------------------------
        // Notes
        // --------------------------------------

        if (
            notes !==
            undefined
        ) {
            invoice.notes =
                String(
                    notes || ""
                ).trim();
        }

        // --------------------------------------
        // Save
        // --------------------------------------

        await invoice.save();

        const updatedInvoice =
            await Invoice.findById(
                invoice._id
            )
                .populate(
                    "patient",
                    "patientId firstName lastName email phone"
                )
                .populate(
                    "createdBy",
                    "name email role"
                );

        return res.status(200).json({
            success: true,
            message:
                "Invoice updated successfully.",
            invoice:
                updatedInvoice
        });
    } catch (error) {
        console.error(
            "Update invoice error:",
            error
        );

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Invoice number already exists."
            });
        }

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    Object.values(
                        error.errors
                    )
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
                "Failed to update invoice."
        });
    }
};

// ==========================================
// DELETE INVOICE
// ==========================================

const deleteInvoice = async (req, res) => {
    try {
        const { id } =
            req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid invoice ID."
            });
        }

        const invoice =
            await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found."
            });
        }

        await Invoice.findByIdAndDelete(
            id
        );

        return res.status(200).json({
            success: true,
            message:
                "Invoice deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete invoice error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete invoice."
        });
    }
};

// ==========================================
// GET BILLING SUMMARY
// ==========================================

const getBillingSummary = async (
    req,
    res
) => {
    try {
        const [
            totalInvoices,
            paidInvoices,
            unpaidInvoices,
            overdueInvoices,
            cancelledInvoices
        ] = await Promise.all([
            Invoice.countDocuments(),

            Invoice.countDocuments({
                status: "paid"
            }),

            Invoice.countDocuments({
                status: {
                    $in: [
                        "unpaid",
                        "partially_paid"
                    ]
                }
            }),

            Invoice.countDocuments({
                status: "overdue"
            }),

            Invoice.countDocuments({
                status: "cancelled"
            })
        ]);

        const totals =
            await Invoice.aggregate([
                {
                    $group: {
                        _id: null,

                        totalBilled: {
                            $sum:
                                "$totalAmount"
                        },

                        totalPaid: {
                            $sum:
                                "$paidAmount"
                        },

                        totalBalance: {
                            $sum:
                                "$balanceAmount"
                        },

                        totalDiscount: {
                            $sum:
                                "$discount"
                        },

                        totalTax: {
                            $sum:
                                "$tax"
                        }
                    }
                }
            ]);

        const summary =
            totals[0] || {
                totalBilled: 0,
                totalPaid: 0,
                totalBalance: 0,
                totalDiscount: 0,
                totalTax: 0
            };

        return res.status(200).json({
            success: true,
            summary: {
                totalInvoices,
                paidInvoices,
                unpaidInvoices,
                overdueInvoices,
                cancelledInvoices,
                totalBilled:
                    roundMoney(
                        summary.totalBilled
                    ),
                totalPaid:
                    roundMoney(
                        summary.totalPaid
                    ),
                totalBalance:
                    roundMoney(
                        summary.totalBalance
                    ),
                totalDiscount:
                    roundMoney(
                        summary.totalDiscount
                    ),
                totalTax:
                    roundMoney(
                        summary.totalTax
                    )
            }
        });
    } catch (error) {
        console.error(
            "Get billing summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve billing summary."
        });
    }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getBillingSummary
};