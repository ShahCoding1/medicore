/* =========================================================
   MEDICORE — PHARMACY INVENTORY CONTROLLER
   Phase 12 — Pharmacy Inventory
   ========================================================= */

const PharmacyInventory =
    require("../models/PharmacyInventory");


/* =========================================================
   HELPERS
   ========================================================= */

function getUserId(req) {
    return req.user?.id || null;
}


function normalizeStatus(status) {
    return String(
        status || "active"
    )
        .trim()
        .toLowerCase();
}


function buildSearchFilter(query) {

    const search =
        String(
            query || ""
        ).trim();

    if (!search) {
        return {};
    }

    const regex =
        new RegExp(
            escapeRegex(search),
            "i"
        );

    return {
        $or: [
            {
                medicineName: regex
            },
            {
                genericName: regex
            },
            {
                brandName: regex
            },
            {
                batchNumber: regex
            },
            {
                supplier: regex
            },
            {
                category: regex
            }
        ]
    };
}


function escapeRegex(value) {
    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
}


function parsePagination(query) {

    const page =
        Math.max(
            Number(query.page) || 1,
            1
        );

    const limit =
        Math.min(
            Math.max(
                Number(query.limit) || 50,
                1
            ),
            100
        );

    const skip =
        (page - 1) * limit;

    return {
        page,
        limit,
        skip
    };
}


function parseDate(value) {

    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}


/* =========================================================
   GET ALL INVENTORY
   GET /api/pharmacy/inventory
   ========================================================= */

const getInventory =
    async (req, res) => {

        try {

            const {
                search,
                category,
                status,
                lowStock,
                expiringSoon,
                expired
            } = req.query;

            const filter = {
                ...buildSearchFilter(
                    search
                )
            };


            /* ---------------------------------------------
               Category
               --------------------------------------------- */

            if (category) {

                filter.category =
                    String(category)
                        .trim();
            }


            /* ---------------------------------------------
               Status
               --------------------------------------------- */

            if (status) {

                filter.status =
                    normalizeStatus(
                        status
                    );
            }


            /* ---------------------------------------------
               Low Stock
               --------------------------------------------- */

            if (
                String(
                    lowStock
                ).toLowerCase() ===
                "true"
            ) {

                filter.$expr = {
                    $lte: [
                        "$quantity",
                        "$reorderLevel"
                    ]
                };
            }


            /* ---------------------------------------------
               Expiry Filters
               --------------------------------------------- */

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            if (
                String(
                    expired
                ).toLowerCase() ===
                "true"
            ) {

                filter.expiryDate = {
                    $lt: today
                };
            }


            if (
                String(
                    expiringSoon
                ).toLowerCase() ===
                "true"
            ) {

                const expiryLimit =
                    new Date(today);

                expiryLimit.setDate(
                    expiryLimit.getDate() +
                    90
                );

                filter.expiryDate = {
                    $gte: today,
                    $lte: expiryLimit
                };
            }


            /* ---------------------------------------------
               Pagination
               --------------------------------------------- */

            const {
                page,
                limit,
                skip
            } =
                parsePagination(
                    req.query
                );


            const [
                inventory,
                total
            ] =
                await Promise.all([

                    PharmacyInventory
                        .find(filter)
                        .sort({
                            medicineName: 1,
                            expiryDate: 1
                        })
                        .skip(skip)
                        .limit(limit)
                        .lean(),

                    PharmacyInventory
                        .countDocuments(
                            filter
                        )
                ]);


            return res.status(200).json({
                success: true,
                inventory,
                pagination: {
                    page,
                    limit,
                    total,
                    pages:
                        Math.ceil(
                            total / limit
                        )
                }
            });

        } catch (error) {

            console.error(
                "Get pharmacy inventory error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load pharmacy inventory."
            });
        }
    };


/* =========================================================
   GET SINGLE INVENTORY ITEM
   GET /api/pharmacy/inventory/:id
   ========================================================= */

const getInventoryItem =
    async (req, res) => {

        try {

            const item =
                await PharmacyInventory
                    .findById(
                        req.params.id
                    )
                    .lean();

            if (!item) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pharmacy inventory item not found."
                });
            }


            return res.status(200).json({
                success: true,
                inventory: item
            });

        } catch (error) {

            console.error(
                "Get pharmacy inventory item error:",
                error
            );

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid inventory ID."
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load the inventory item."
            });
        }
    };


/* =========================================================
   CREATE INVENTORY ITEM
   POST /api/pharmacy/inventory
   ========================================================= */

const createInventory =
    async (req, res) => {

        try {

            const {
                medicineName,
                genericName,
                brandName,
                category,
                dosageForm,
                strength,
                batchNumber,
                expiryDate,
                quantity,
                reorderLevel,
                unit,
                status,
                purchasePrice,
                sellingPrice,
                supplier,
                supplierContact,
                location,
                notes
            } = req.body;


            /* ---------------------------------------------
               Required fields
               --------------------------------------------- */

            if (
                !medicineName ||
                !String(
                    medicineName
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Medicine name is required."
                });
            }


            if (
                !category ||
                !String(
                    category
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Medicine category is required."
                });
            }


            if (
                !batchNumber ||
                !String(
                    batchNumber
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Batch number is required."
                });
            }


            const parsedExpiry =
                parseDate(
                    expiryDate
                );

            if (!parsedExpiry) {

                return res.status(400).json({
                    success: false,
                    message:
                        "A valid expiry date is required."
                });
            }


            /* ---------------------------------------------
               Numeric validation
               --------------------------------------------- */

            const parsedQuantity =
                Number(
                    quantity ?? 0
                );

            const parsedReorderLevel =
                Number(
                    reorderLevel ?? 0
                );

            const parsedPurchasePrice =
                Number(
                    purchasePrice ?? 0
                );

            const parsedSellingPrice =
                Number(
                    sellingPrice ?? 0
                );


            if (
                !Number.isFinite(
                    parsedQuantity
                ) ||
                parsedQuantity < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Quantity must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    parsedReorderLevel
                ) ||
                parsedReorderLevel < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Reorder level must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    parsedPurchasePrice
                ) ||
                parsedPurchasePrice < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Purchase price must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    parsedSellingPrice
                ) ||
                parsedSellingPrice < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selling price must be zero or greater."
                });
            }


            if (
                parsedSellingPrice <
                parsedPurchasePrice
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selling price cannot be lower than purchase price."
                });
            }


            /* ---------------------------------------------
               Duplicate batch protection
               --------------------------------------------- */

            const existing =
                await PharmacyInventory.findOne({
                    medicineName:
                        String(
                            medicineName
                        ).trim(),

                    batchNumber:
                        String(
                            batchNumber
                        ).trim()
                });


            if (existing) {

                return res.status(409).json({
                    success: false,
                    message:
                        "A medicine with the same batch number already exists."
                });
            }


            /* ---------------------------------------------
               Create
               --------------------------------------------- */

            const inventory =
                await PharmacyInventory.create({

                    medicineName:
                        String(
                            medicineName
                        ).trim(),

                    genericName:
                        String(
                            genericName || ""
                        ).trim(),

                    brandName:
                        String(
                            brandName || ""
                        ).trim(),

                    category:
                        String(
                            category
                        ).trim(),

                    dosageForm:
                        String(
                            dosageForm || ""
                        ).trim(),

                    strength:
                        String(
                            strength || ""
                        ).trim(),

                    batchNumber:
                        String(
                            batchNumber
                        ).trim(),

                    expiryDate:
                        parsedExpiry,

                    quantity:
                        parsedQuantity,

                    reorderLevel:
                        parsedReorderLevel,

                    unit:
                        String(
                            unit || "units"
                        ).trim(),

                    status:
                        normalizeStatus(
                            status
                        ),

                    purchasePrice:
                        parsedPurchasePrice,

                    sellingPrice:
                        parsedSellingPrice,

                    supplier:
                        String(
                            supplier || ""
                        ).trim(),

                    supplierContact:
                        String(
                            supplierContact ||
                            ""
                        ).trim(),

                    location:
                        String(
                            location || ""
                        ).trim(),

                    notes:
                        String(
                            notes || ""
                        ).trim(),

                    createdBy:
                        getUserId(req)

                });


            return res.status(201).json({
                success: true,
                message:
                    "Medicine added to pharmacy inventory successfully.",
                inventory
            });

        } catch (error) {

            console.error(
                "Create pharmacy inventory error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to add medicine to pharmacy inventory."
            });
        }
    };


/* =========================================================
   UPDATE INVENTORY ITEM
   PUT /api/pharmacy/inventory/:id
   ========================================================= */

const updateInventory =
    async (req, res) => {

        try {

            const inventory =
                await PharmacyInventory
                    .findById(
                        req.params.id
                    );

            if (!inventory) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pharmacy inventory item not found."
                });
            }


            const allowedFields = [
                "medicineName",
                "genericName",
                "brandName",
                "category",
                "dosageForm",
                "strength",
                "batchNumber",
                "expiryDate",
                "quantity",
                "reorderLevel",
                "unit",
                "status",
                "purchasePrice",
                "sellingPrice",
                "supplier",
                "supplierContact",
                "location",
                "notes"
            ];


            for (
                const field of allowedFields
            ) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        req.body,
                        field
                    )
                ) {

                    inventory[field] =
                        req.body[field];
                }
            }


            /* ---------------------------------------------
               Required validation
               --------------------------------------------- */

            if (
                !inventory.medicineName ||
                !String(
                    inventory.medicineName
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Medicine name is required."
                });
            }


            if (
                !inventory.category ||
                !String(
                    inventory.category
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Medicine category is required."
                });
            }


            if (
                !inventory.batchNumber ||
                !String(
                    inventory.batchNumber
                ).trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Batch number is required."
                });
            }


            const parsedExpiry =
                parseDate(
                    inventory.expiryDate
                );

            if (!parsedExpiry) {

                return res.status(400).json({
                    success: false,
                    message:
                        "A valid expiry date is required."
                });
            }

            inventory.expiryDate =
                parsedExpiry;


            /* ---------------------------------------------
               Numeric normalization
               --------------------------------------------- */

            inventory.quantity =
                Number(
                    inventory.quantity
                );

            inventory.reorderLevel =
                Number(
                    inventory.reorderLevel
                );

            inventory.purchasePrice =
                Number(
                    inventory.purchasePrice
                );

            inventory.sellingPrice =
                Number(
                    inventory.sellingPrice
                );


            if (
                !Number.isFinite(
                    inventory.quantity
                ) ||
                inventory.quantity < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Quantity must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    inventory.reorderLevel
                ) ||
                inventory.reorderLevel < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Reorder level must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    inventory.purchasePrice
                ) ||
                inventory.purchasePrice < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Purchase price must be zero or greater."
                });
            }


            if (
                !Number.isFinite(
                    inventory.sellingPrice
                ) ||
                inventory.sellingPrice < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selling price must be zero or greater."
                });
            }


            if (
                inventory.sellingPrice <
                inventory.purchasePrice
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Selling price cannot be lower than purchase price."
                });
            }


            inventory.status =
                normalizeStatus(
                    inventory.status
                );


            /* ---------------------------------------------
               Duplicate batch protection
               --------------------------------------------- */

            const duplicate =
                await PharmacyInventory.findOne({
                    _id: {
                        $ne:
                            inventory._id
                    },

                    medicineName:
                        String(
                            inventory.medicineName
                        ).trim(),

                    batchNumber:
                        String(
                            inventory.batchNumber
                        ).trim()
                });


            if (duplicate) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Another medicine with the same batch number already exists."
                });
            }


            await inventory.save();


            return res.status(200).json({
                success: true,
                message:
                    "Pharmacy inventory updated successfully.",
                inventory
            });

        } catch (error) {

            console.error(
                "Update pharmacy inventory error:",
                error
            );

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid inventory ID."
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Unable to update pharmacy inventory."
            });
        }
    };


/* =========================================================
   DELETE INVENTORY ITEM
   DELETE /api/pharmacy/inventory/:id
   ========================================================= */

const deleteInventory =
    async (req, res) => {

        try {

            const inventory =
                await PharmacyInventory
                    .findByIdAndDelete(
                        req.params.id
                    );

            if (!inventory) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pharmacy inventory item not found."
                });
            }


            return res.status(200).json({
                success: true,
                message:
                    "Pharmacy inventory item deleted successfully."
            });

        } catch (error) {

            console.error(
                "Delete pharmacy inventory error:",
                error
            );

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid inventory ID."
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete pharmacy inventory item."
            });
        }
    };


/* =========================================================
   GET CATEGORIES
   GET /api/pharmacy/inventory/categories
   ========================================================= */

const getCategories =
    async (req, res) => {

        try {

            const categories =
                await PharmacyInventory
                    .distinct(
                        "category"
                    );

            categories.sort(
                (a, b) =>
                    String(a)
                        .localeCompare(
                            String(b)
                        )
            );


            return res.status(200).json({
                success: true,
                categories
            });

        } catch (error) {

            console.error(
                "Get pharmacy categories error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load pharmacy categories."
            });
        }
    };


/* =========================================================
   EXPORT CONTROLLERS
   ========================================================= */

module.exports = {
    getInventory,
    getInventoryItem,
    createInventory,
    updateInventory,
    deleteInventory,
    getCategories
};