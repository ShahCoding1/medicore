const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");

const getDashboardOverview = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({
            owner: req.user.id
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup not found."
            });
        }

        const hospitalId = hospital._id;

        const [
            patients,
            doctors,
            appointments,
            revenue,
            recentPatients,
            todayAppointments,
            revenueHistory,
            patientGrowth
        ] = await Promise.all([

            // Total active patients
            Patient.countDocuments({
                hospital: hospitalId,
                status: "active"
            }),

            // Total active doctors
            User.countDocuments({
                role: "doctor",
                isActive: true
            }),

            // Total appointments
            Appointment.countDocuments({
                hospital: hospitalId,
                status: {
                    $in: ["scheduled", "completed"]
                }
            }),

            // Total paid revenue
            Invoice.aggregate([
                {
                    $match: {
                        hospital: hospitalId,
                        status: "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount"
                        }
                    }
                }
            ]),

            // Recent patients
            Patient.find({
                hospital: hospitalId
            })
                .populate("department", "name")
                .sort({
                    createdAt: -1
                })
                .limit(5)
                .lean(),

            // Today's appointments
            Appointment.find({
                hospital: hospitalId,

                appointmentDate: {
                    $gte: new Date(
                        new Date().setHours(
                            0,
                            0,
                            0,
                            0
                        )
                    ),

                    $lt: new Date(
                        new Date().setHours(
                            23,
                            59,
                            59,
                            999
                        )
                    )
                }
            })
                .populate(
                    "patient",
                    "firstName lastName"
                )
                .populate(
                    "doctor",
                    "name"
                )
                .sort({
                    appointmentDate: 1
                })
                .limit(10)
                .lean(),

            // Revenue history
            Invoice.aggregate([
                {
                    $match: {
                        hospital: hospitalId,
                        status: "paid"
                    }
                },

                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },

                        total: {
                            $sum: "$amount"
                        }
                    }
                },

                {
                    $sort: {
                        _id: 1
                    }
                }
            ]),

            // Patient growth history
            Patient.aggregate([
                {
                    $match: {
                        hospital: hospitalId
                    }
                },

                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },

                        total: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        _id: 1
                    }
                }
            ])
        ]);

        return res.status(200).json({
            success: true,

            data: {
                patients,

                doctors,

                appointments,

                revenue:
                    revenue[0]?.total || 0,

                admissions: 0,

                discharges: 0,

                bedOccupancy: 0,

                pendingLabTests: 0,

                recentPatients,

                todayAppointments,

                revenueHistory,

                patientGrowth
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardOverview
};