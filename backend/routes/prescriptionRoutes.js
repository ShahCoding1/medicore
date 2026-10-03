const express = require("express");

const {
    getPrescriptions,
    getPrescription,
    createPrescription,
    updatePrescription,
    deletePrescription,
    getPrescriptionSummary
} = require("../controllers/prescriptionController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get(
    "/summary",
    getPrescriptionSummary
);

router.get(
    "/",
    getPrescriptions
);

router.post(
    "/",
    createPrescription
);

router.get(
    "/:id",
    getPrescription
);

router.put(
    "/:id",
    updatePrescription
);

router.delete(
    "/:id",
    deletePrescription
);

module.exports = router;