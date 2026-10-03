const mongoose = require("mongoose");

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const Admission = require("../models/Admission");
const Discharge = require("../models/Discharge");
const Bed = require("../models/Bed");
const LabTest = require("../models/LabTest");

const validId = (id) =>
    id && mongoose.Types.ObjectId.isValid(id);

const getRange = (range) => {
    const end = new Date();
    const start = new Date(end);

    switch (range) {
        case "today":
            start.setHours(0, 0, 0, 0);
            break;
        case "7d":
            start.setDate(start.getDate() - 7);
            break;
        case "90d":
            start.setDate(start.getDate() - 90);
            break;
        case "12m":
            start.setFullYear(start.getFullYear() - 1);
            break;
        case "30d":
        default:
            start.setDate(start.getDate() - 30);
    }

    return { start, end };
};

const getAnalytics = async (req, res) => {
    try {
        const {
            range = "30d",
            department = "",
            doctor = "",
            gender = "",
            ageGroup = "",
            patientType = ""
        } = req.query;

        const { start, end } = getRange(range);

        const patientQuery = {
            createdAt: { $gte: start, $lte: end }
        };

        if (gender) patientQuery.gender = gender;
        if (validId(department))
            patientQuery.department = department;

        if (ageGroup) {
            const ages = {
                under18: [0, 17],
                "18-30": [18, 30],
                "31-50": [31, 50],
                "51-65": [51, 65],
                "65+": [66, 150]
            };

            if (ages[ageGroup]) {
                patientQuery.age = {
                    $gte: ages[ageGroup][0],
                    $lte: ages[ageGroup][1]
                };
            }
        }

        if (patientType)
            patientQuery.patientType = patientType;

        const appointmentQuery = {
            createdAt: { $gte: start, $lte: end }
        };

        if (validId(doctor))
            appointmentQuery.doctor = doctor;

        if (validId(department))
            appointmentQuery.department = department;

        const [
            newPatients,
            activePatients,
            appointments,
            admissions,
            discharges,
            invoices,
            beds,
            labTests
        ] = await Promise.all([
            Patient.countDocuments(patientQuery),
            Patient.countDocuments({
                ...patientQuery,
                status: "active"
            }),
            Appointment.countDocuments(appointmentQuery),
            Admission.countDocuments({
                admissionDate: {
                    $gte: start,
                    $lte: end
                }
            }),
            Discharge.countDocuments({
                dischargeDate: {
                    $gte: start,
                    $lte: end
                }
            }),
            Invoice.find({
                invoiceDate: {
                    $gte: start,
                    $lte: end
                }
            }).lean(),
            Bed.countDocuments({ status: "occupied" }),
            LabTest.countDocuments({
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            })
        ]);

        const revenue = invoices.reduce(
            (sum, invoice) =>
                sum + Number(invoice.totalAmount || 0),
            0
        );

        const collections = invoices.reduce(
            (sum, invoice) =>
                sum + Number(invoice.paidAmount || 0),
            0
        );

        const outstanding = invoices.reduce(
            (sum, invoice) =>
                sum + Number(invoice.balanceAmount || 0),
            0
        );

        const bedTotal =
            await Bed.countDocuments();

        const bedOccupancy =
            bedTotal > 0
                ? Math.round(
                      (beds / bedTotal) * 100
                  )
                : 0;

        const noShows =
            await Appointment.countDocuments({
                ...appointmentQuery,
                status: {
                    $in: ["no_show", "no-show"]
                }
            });

        return res.status(200).json({
            success: true,
            data: {
                filters: {
                    range,
                    department,
                    doctor,
                    gender,
                    ageGroup,
                    patientType
                },
                patients: {
                    newPatients,
                    returningPatients: 0,
                    activePatients,
                    admissions,
                    discharges,
                    appointments,
                    noShows
                },
                financial: {
                    revenue,
                    collections,
                    outstanding,
                    refunds: 0
                },
                clinical: {
                    diagnoses: 0,
                    labVolume: labTests,
                    prescriptions: 0,
                    patientDemographics: newPatients,
                    departmentWorkload: appointments,
                    doctorWorkload: appointments
                },
                operational: {
                    bedOccupancy,
                    averageWaitingTime: 0,
                    appointmentUtilization: 0,
                    doctorUtilization: 0,
                    departmentCapacity: bedTotal
                }
            }
        });
    } catch (error) {
        console.error("Analytics error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load analytics."
        });
    }
};

module.exports = {
    getAnalytics
};