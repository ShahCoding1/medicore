const express = require("express");

const {
    getInventory,
    getInventoryItem,
    createInventory,
    updateInventory,
    deleteInventory,
    getCategories
} = require("../controllers/pharmacyController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Pharmacy Inventory Routes
|--------------------------------------------------------------------------
| Base path:
| /api/pharmacy/inventory
|
| Authentication is required for all pharmacy inventory operations.
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
| Keep /categories before /:id so "categories" is not interpreted as
| an inventory document ID.
|--------------------------------------------------------------------------
*/

router.get("/categories", getCategories);

/*
|--------------------------------------------------------------------------
| Inventory Collection
|--------------------------------------------------------------------------
*/

router.get("/", getInventory);

router.post("/", createInventory);

/*
|--------------------------------------------------------------------------
| Single Inventory Item
|--------------------------------------------------------------------------
*/

router.get("/:id", getInventoryItem);

router.put("/:id", updateInventory);

router.delete("/:id", deleteInventory);

module.exports = router;