const express = require("express");

const {
    getLabTests,
    getLabTest,
    createLabTest,
    updateLabTest,
    deleteLabTest,
    getCategories
} = require("../controllers/labTestController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Laboratory Test Routes
|--------------------------------------------------------------------------
| Base path:
| /api/laboratory/tests
|
| Authentication is required for all laboratory test operations.
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
| Must be declared before /:id so "categories" is not treated as an ID.
|--------------------------------------------------------------------------
*/

router.get("/categories", getCategories);

/*
|--------------------------------------------------------------------------
| Laboratory Test Collection
|--------------------------------------------------------------------------
*/

router.get("/", getLabTests);

router.post("/", createLabTest);

/*
|--------------------------------------------------------------------------
| Single Laboratory Test
|--------------------------------------------------------------------------
*/

router.get("/:id", getLabTest);

router.put("/:id", updateLabTest);

router.delete("/:id", deleteLabTest);

module.exports = router;