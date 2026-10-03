const mongoose = require("mongoose");

const Bed = require("../models/Bed");
const Patient = require("../models/Patient");
const Admission = require("../models/Admission");

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

const populateBed = (query) =>
    query
        .populate({
            path: "patient",
            select: "firstName lastName patientId phone"
        })
        .populate({
            path: "admission",
            select: "admissionNumber admissionDate status"
        })
        .populate({
            path: "createdBy",
            select: "firstName lastName email"
        })
        .populate({
            path: "updatedBy",
            select: "firstName lastName email"
        });

/* =========================================================
   GET ALL BEDS
========================================================= */

const getBeds = async (req, res) => {
    try {
        const {
            status,
            bedType,
            ward,
            floor,
            search
        } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (bedType) {
            filter.bedType = bedType;
        }

        if (ward) {
            filter.ward = {
                $regex: ward,
                $options: "i"
            };
        }

        if (floor) {
            filter.floor = {
                $regex: floor,
                $options: "i"
            };
        }

        if (search) {
            filter.$or = [
                {
                    bedNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    ward: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    roomNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    floor: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const beds = await populateBed(
            Bed.find(filter).sort({
                ward: 1,
                roomNumber: 1,
                bedNumber: 1
            })
        );

        return res.status(200).json({
            success: true,
            count: beds.length,
            data: beds
        });
    } catch (error) {
        console.error("Get beds error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve beds."
        });
    }
};


/* =========================================================
   GET BED SUMMARY
========================================================= */

const getBedSummary = async (req, res) => {
    try {
        const [
            total,
            available,
            occupied,
            reserved,
            maintenance,
            blocked
        ] = await Promise.all([
            Bed.countDocuments(),
            Bed.countDocuments({ status: "available" }),
            Bed.countDocuments({ status: "occupied" }),
            Bed.countDocuments({ status: "reserved" }),
            Bed.countDocuments({ status: "maintenance" }),
            Bed.countDocuments({ status: "blocked" })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total,
                available,
                occupied,
                reserved,
                maintenance,
                blocked
            }
        });
    } catch (error) {
        console.error("Get bed summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve bed summary."
        });
    }
};


/* =========================================================
   GET SINGLE BED
========================================================= */

const getBed = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID."
            });
        }

        const bed = await populateBed(
            Bed.findById(id)
        );

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: bed
        });
    } catch (error) {
        console.error("Get bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve bed."
        });
    }
};


/* =========================================================
   CREATE BED
========================================================= */

const createBed = async (req, res) => {
    try {
        const {
            bedNumber,
            ward,
            roomNumber,
            bedType,
            status,
            patient,
            admission,
            floor,
            notes
        } = req.body;

        if (!bedNumber || !ward) {
            return res.status(400).json({
                success: false,
                message: "Bed number and ward are required."
            });
        }

        const normalizedBedNumber =
            String(bedNumber).trim().toUpperCase();

        const existingBed = await Bed.findOne({
            bedNumber: normalizedBedNumber
        });

        if (existingBed) {
            return res.status(409).json({
                success: false,
                message: "A bed with this bed number already exists."
            });
        }

        if (patient && !isValidObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        if (admission && !isValidObjectId(admission)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        if (patient) {
            const patientExists =
                await Patient.exists({ _id: patient });

            if (!patientExists) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found."
                });
            }
        }

        if (admission) {
            const admissionExists =
                await Admission.exists({ _id: admission });

            if (!admissionExists) {
                return res.status(404).json({
                    success: false,
                    message: "Admission not found."
                });
            }
        }

        const bed = await Bed.create({
            bedNumber: normalizedBedNumber,
            ward,
            roomNumber,
            bedType,
            status: status || "available",
            patient: patient || null,
            admission: admission || null,
            floor,
            notes,
            createdBy: req.user?.id
        });

        const populatedBed = await populateBed(
            Bed.findById(bed._id)
        );

        return res.status(201).json({
            success: true,
            message: "Bed created successfully.",
            data: populatedBed
        });
    } catch (error) {
        console.error("Create bed error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A bed with this bed number already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create bed."
        });
    }
};


/* =========================================================
   UPDATE BED
========================================================= */

const updateBed = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID."
            });
        }

        const bed = await Bed.findById(id);

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });
        }

        const allowedFields = [
            "bedNumber",
            "ward",
            "roomNumber",
            "bedType",
            "status",
            "patient",
            "admission",
            "floor",
            "notes"
        ];

        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                bed[field] = req.body[field];
            }
        }

        if (req.body.bedNumber !== undefined) {
            bed.bedNumber = String(
                req.body.bedNumber
            )
                .trim()
                .toUpperCase();
        }

        if (
            bed.patient &&
            !isValidObjectId(bed.patient)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        if (
            bed.admission &&
            !isValidObjectId(bed.admission)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        if (bed.patient) {
            const patientExists =
                await Patient.exists({
                    _id: bed.patient
                });

            if (!patientExists) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found."
                });
            }
        }

        if (bed.admission) {
            const admissionExists =
                await Admission.exists({
                    _id: bed.admission
                });

            if (!admissionExists) {
                return res.status(404).json({
                    success: false,
                    message: "Admission not found."
                });
            }
        }

        const duplicate = await Bed.findOne({
            bedNumber: bed.bedNumber,
            _id: { $ne: id }
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Another bed already uses this bed number."
            });
        }

        bed.updatedBy = req.user?.id;

        await bed.save();

        const populatedBed = await populateBed(
            Bed.findById(bed._id)
        );

        return res.status(200).json({
            success: true,
            message: "Bed updated successfully.",
            data: populatedBed
        });
    } catch (error) {
        console.error("Update bed error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A bed with this bed number already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update bed."
        });
    }
};


/* =========================================================
   DELETE BED
========================================================= */

const deleteBed = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID."
            });
        }

        const bed = await Bed.findById(id);

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });
        }

        if (
            bed.status === "occupied" ||
            bed.patient ||
            bed.admission
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Occupied or assigned beds cannot be deleted."
            });
        }

        await Bed.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Bed deleted successfully."
        });
    } catch (error) {
        console.error("Delete bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete bed."
        });
    }
};


/* =========================================================
   ASSIGN BED
========================================================= */

const assignBed = async (req, res) => {
    try {
        const { id } = req.params;
        const { patient, admission } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID."
            });
        }

        if (!patient || !isValidObjectId(patient)) {
            return res.status(400).json({
                success: false,
                message: "A valid patient ID is required."
            });
        }

        const bed = await Bed.findById(id);

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });
        }

        if (bed.status === "occupied") {
            return res.status(409).json({
                success: false,
                message: "This bed is already occupied."
            });
        }

        if (
            ["maintenance", "blocked"].includes(
                bed.status
            )
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "This bed is not available for assignment."
            });
        }

        const patientExists =
            await Patient.exists({ _id: patient });

        if (!patientExists) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        if (
            admission &&
            !isValidObjectId(admission)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid admission ID."
            });
        }

        if (admission) {
            const admissionExists =
                await Admission.exists({
                    _id: admission
                });

            if (!admissionExists) {
                return res.status(404).json({
                    success: false,
                    message: "Admission not found."
                });
            }
        }

        bed.patient = patient;
        bed.admission = admission || null;
        bed.status = "occupied";
        bed.updatedBy = req.user?.id;

        await bed.save();

        const populatedBed = await populateBed(
            Bed.findById(bed._id)
        );

        return res.status(200).json({
            success: true,
            message: "Bed assigned successfully.",
            data: populatedBed
        });
    } catch (error) {
        console.error("Assign bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to assign bed."
        });
    }
};


/* =========================================================
   RELEASE BED
========================================================= */

const releaseBed = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bed ID."
            });
        }

        const bed = await Bed.findById(id);

        if (!bed) {
            return res.status(404).json({
                success: false,
                message: "Bed not found."
            });
        }

        bed.patient = null;
        bed.admission = null;
        bed.status = "available";
        bed.updatedBy = req.user?.id;

        await bed.save();

        const populatedBed = await populateBed(
            Bed.findById(bed._id)
        );

        return res.status(200).json({
            success: true,
            message: "Bed released successfully.",
            data: populatedBed
        });
    } catch (error) {
        console.error("Release bed error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to release bed."
        });
    }
};


module.exports = {
    getBeds,
    getBedSummary,
    getBed,
    createBed,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed
};