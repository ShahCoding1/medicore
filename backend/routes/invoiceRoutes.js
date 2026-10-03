const express = require("express");

const {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getBillingSummary
} = require("../controllers/invoiceController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(protect);

// ==========================================
// BILLING SUMMARY
// ==========================================

router.get(
    "/summary",
    getBillingSummary
);

// ==========================================
// INVOICE COLLECTION
// ==========================================

router.get(
    "/",
    getInvoices
);

router.post(
    "/",
    createInvoice
);

// ==========================================
// SINGLE INVOICE
// ==========================================

router.get(
    "/:id",
    getInvoice
);

router.put(
    "/:id",
    updateInvoice
);

router.delete(
    "/:id",
    deleteInvoice
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;