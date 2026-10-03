const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const PharmacyInventory = require("../models/PharmacyInventory");
const LabTest = require("../models/LabTest");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchCollection = async (Model, query, fields, category, path) => {
    const regex = new RegExp(escapeRegex(query), "i");

    const conditions = fields.map((field) => ({
        [field]: regex
    }));

    const docs = await Model.find({ $or: conditions })
        .limit(8)
        .lean();

    return docs.map((doc) => ({
        id: doc._id,
        category,
        title:
            doc.fullName ||
            `${doc.firstName || ""} ${doc.lastName || ""}`.trim() ||
            doc.name ||
            doc.patientId ||
            doc.doctorId ||
            doc.invoiceNumber ||
            doc.appointmentNumber ||
            doc.testName ||
            doc.prescriptionNumber ||
            doc.name ||
            "Record",
        subtitle:
            doc.email ||
            doc.phone ||
            doc.specialization ||
            doc.status ||
            doc.description ||
            "",
        url: `${path}/${doc._id}`
    }));
};

const globalSearch = async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();

        if (!query) {
            return res.json({
                success: true,
                query: "",
                results: []
            });
        }

        if (query.length < 2) {
            return res.json({
                success: true,
                query,
                results: []
            });
        }

        const searches = await Promise.allSettled([
            searchCollection(
                Patient,
                query,
                ["firstName", "lastName", "patientId", "email", "phone"],
                "Patients",
                "/patients"
            ),

            searchCollection(
                Doctor,
                query,
                [
                    "firstName",
                    "lastName",
                    "doctorId",
                    "email",
                    "phone",
                    "specialization"
                ],
                "Doctors",
                "/doctors"
            ),

            searchCollection(
                Appointment,
                query,
                [
                    "appointmentNumber",
                    "status",
                    "appointmentType",
                    "reason"
                ],
                "Appointments",
                "/appointments"
            ),

            searchCollection(
                Invoice,
                query,
                [
                    "invoiceNumber",
                    "status",
                    "paymentMethod",
                    "notes"
                ],
                "Invoices",
                "/billing"
            ),

            searchCollection(
                PharmacyInventory,
                query,
                [
                    "medicineName",
                    "genericName",
                    "category",
                    "status"
                ],
                "Medicines",
                "/pharmacy"
            ),

            searchCollection(
                LabTest,
                query,
                [
                    "testName",
                    "testCode",
                    "category",
                    "status"
                ],
                "Lab Tests",
                "/laboratory/tests"
            ),

            searchCollection(
                Prescription,
                query,
                [
                    "prescriptionNumber",
                    "status",
                    "notes"
                ],
                "Prescriptions",
                "/prescriptions"
            ),

            searchCollection(
                Report,
                query,
                [
                    "name",
                    "category",
                    "reportType",
                    "status"
                ],
                "Reports",
                "/reports"
            )
        ]);

        const results = [];

        searches.forEach((result) => {
            if (result.status === "fulfilled") {
                results.push(...result.value);
            }
        });

        res.json({
            success: true,
            query,
            results
        });
    } catch (error) {
        console.error("Global search error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to perform global search."
        });
    }
};

module.exports = {
    globalSearch
};