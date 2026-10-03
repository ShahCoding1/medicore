const LabTest = require("../models/LabTest");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getUserId = (req) => {
    return req.user?.id || req.user?._id || null;
};

const normalizeStatus = (status) => {
    if (!status) return undefined;

    const normalized = String(status).trim().toLowerCase();

    if (["active", "inactive"].includes(normalized)) {
        return normalized;
    }

    return null;
};

const escapeRegex = (value) => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePagination = (req) => {
    const page = Math.max(
        parseInt(req.query.page, 10) || 1,
        1
    );

    const limit = Math.min(
        Math.max(
            parseInt(req.query.limit, 10) || 20,
            1
        ),
        100
    );

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

/*
|--------------------------------------------------------------------------
| GET /api/laboratory/tests
| Get all laboratory tests
|--------------------------------------------------------------------------
*/

const getLabTests = async (req, res) => {
    try {
        const {
            search,
            category,
            status
        } = req.query;

        const { page, limit, skip } = parsePagination(req);

        const filter = {};

        if (search && String(search).trim()) {
            const searchRegex = new RegExp(
                escapeRegex(String(search).trim()),
                "i"
            );

            filter.$or = [
                { testName: searchRegex },
                { testCode: searchRegex },
                { category: searchRegex },
                { sampleType: searchRegex }
            ];
        }

        if (category && String(category).trim()) {
            filter.category = String(category).trim();
        }

        if (status) {
            const normalizedStatus = normalizeStatus(status);

            if (normalizedStatus === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid laboratory test status."
                });
            }

            filter.status = normalizedStatus;
        }

        const [tests, total] = await Promise.all([
            LabTest.find(filter)
                .populate("createdBy", "name email role")
                .sort({
                    testName: 1,
                    category: 1
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            LabTest.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            tests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(
            "Get laboratory tests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve laboratory tests.",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/laboratory/tests/:id
| Get one laboratory test
|--------------------------------------------------------------------------
*/

const getLabTest = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await LabTest.findById(id)
            .populate("createdBy", "name email role");

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Laboratory test not found."
            });
        }

        return res.status(200).json({
            success: true,
            test
        });
    } catch (error) {
        console.error(
            "Get laboratory test error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid laboratory test ID."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve laboratory test.",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| POST /api/laboratory/tests
| Create laboratory test
|--------------------------------------------------------------------------
*/

const createLabTest = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user is required."
            });
        }

        const {
            testName,
            testCode,
            category,
            description,
            sampleType,
            preparationRequired,
            preparationInstructions,
            turnaroundTime,
            price,
            status
        } = req.body;

        if (
            !testName ||
            !String(testName).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Test name is required."
            });
        }

        if (
            !testCode ||
            !String(testCode).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Test code is required."
            });
        }

        if (
            !category ||
            !String(category).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Test category is required."
            });
        }

        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Test price is required."
            });
        }

        const numericPrice = Number(price);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Test price must be a valid non-negative number."
            });
        }

        let normalizedStatus = "active";

        if (status !== undefined) {
            normalizedStatus = normalizeStatus(status);

            if (normalizedStatus === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid laboratory test status."
                });
            }
        }

        const normalizedCode = String(testCode)
            .trim()
            .toUpperCase();

        const existingTest = await LabTest.findOne({
            testCode: normalizedCode
        });

        if (existingTest) {
            return res.status(409).json({
                success: false,
                message: "A laboratory test with this code already exists."
            });
        }

        const test = await LabTest.create({
            testName: String(testName).trim(),
            testCode: normalizedCode,
            category: String(category).trim(),
            description: description
                ? String(description).trim()
                : "",
            sampleType: sampleType
                ? String(sampleType).trim()
                : "",
            preparationRequired:
                preparationRequired === true ||
                preparationRequired === "true",
            preparationInstructions:
                preparationInstructions
                    ? String(preparationInstructions).trim()
                    : "",
            turnaroundTime:
                turnaroundTime
                    ? String(turnaroundTime).trim()
                    : "",
            price: numericPrice,
            status: normalizedStatus,
            createdBy: userId
        });

        const populatedTest = await LabTest.findById(test._id)
            .populate("createdBy", "name email role");

        return res.status(201).json({
            success: true,
            message: "Laboratory test created successfully.",
            test: populatedTest
        });
    } catch (error) {
        console.error(
            "Create laboratory test error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A laboratory test with this code already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create laboratory test.",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| PUT /api/laboratory/tests/:id
| Update laboratory test
|--------------------------------------------------------------------------
*/

const updateLabTest = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await LabTest.findById(id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Laboratory test not found."
            });
        }

        const allowedFields = [
            "testName",
            "testCode",
            "category",
            "description",
            "sampleType",
            "preparationRequired",
            "preparationInstructions",
            "turnaroundTime",
            "price",
            "status"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                updates[field] = req.body[field];
            }
        });

        if (
            updates.testName !== undefined &&
            !String(updates.testName).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Test name cannot be empty."
            });
        }

        if (
            updates.testCode !== undefined
        ) {
            const normalizedCode = String(
                updates.testCode
            )
                .trim()
                .toUpperCase();

            if (!normalizedCode) {
                return res.status(400).json({
                    success: false,
                    message: "Test code cannot be empty."
                });
            }

            const duplicate = await LabTest.findOne({
                testCode: normalizedCode,
                _id: { $ne: id }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "A laboratory test with this code already exists."
                });
            }

            updates.testCode = normalizedCode;
        }

        if (
            updates.category !== undefined &&
            !String(updates.category).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Test category cannot be empty."
            });
        }

        if (updates.price !== undefined) {
            const numericPrice = Number(
                updates.price
            );

            if (
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Test price must be a valid non-negative number."
                });
            }

            updates.price = numericPrice;
        }

        if (updates.status !== undefined) {
            const normalizedStatus =
                normalizeStatus(updates.status);

            if (normalizedStatus === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid laboratory test status."
                });
            }

            updates.status = normalizedStatus;
        }

        if (updates.testName !== undefined) {
            updates.testName =
                String(updates.testName).trim();
        }

        if (updates.category !== undefined) {
            updates.category =
                String(updates.category).trim();
        }

        if (updates.description !== undefined) {
            updates.description =
                String(updates.description).trim();
        }

        if (updates.sampleType !== undefined) {
            updates.sampleType =
                String(updates.sampleType).trim();
        }

        if (
            updates.preparationInstructions !==
            undefined
        ) {
            updates.preparationInstructions =
                String(
                    updates.preparationInstructions
                ).trim();
        }

        if (updates.turnaroundTime !== undefined) {
            updates.turnaroundTime =
                String(
                    updates.turnaroundTime
                ).trim();
        }

        if (
            updates.preparationRequired !==
            undefined
        ) {
            updates.preparationRequired =
                updates.preparationRequired === true ||
                updates.preparationRequired === "true";
        }

        Object.assign(test, updates);

        await test.save();

        const populatedTest =
            await LabTest.findById(test._id)
                .populate(
                    "createdBy",
                    "name email role"
                );

        return res.status(200).json({
            success: true,
            message: "Laboratory test updated successfully.",
            test: populatedTest
        });
    } catch (error) {
        console.error(
            "Update laboratory test error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid laboratory test ID."
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A laboratory test with this code already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update laboratory test.",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/laboratory/tests/:id
| Delete laboratory test
|--------------------------------------------------------------------------
*/

const deleteLabTest = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await LabTest.findById(id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Laboratory test not found."
            });
        }

        await test.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Laboratory test deleted successfully."
        });
    } catch (error) {
        console.error(
            "Delete laboratory test error:",
            error
        );

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid laboratory test ID."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to delete laboratory test.",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| GET /api/laboratory/tests/categories
| Get unique laboratory test categories
|--------------------------------------------------------------------------
*/

const getCategories = async (req, res) => {
    try {
        const categories = await LabTest.distinct(
            "category",
            {
                category: {
                    $exists: true,
                    $nin: ["", null]
                }
            }
        );

        categories.sort((a, b) =>
            String(a).localeCompare(
                String(b)
            )
        );

        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error(
            "Get laboratory categories error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve laboratory categories.",
            error: error.message
        });
    }
};

module.exports = {
    getLabTests,
    getLabTest,
    createLabTest,
    updateLabTest,
    deleteLabTest,
    getCategories
};