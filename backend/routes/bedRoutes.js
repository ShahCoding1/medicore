const express = require("express");

const {
    getBeds,
    getBedSummary,
    getBed,
    createBed,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed
} = require("../controllers/bedController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

/*
|--------------------------------------------------------------------------
| Bed Summary
|--------------------------------------------------------------------------
| Keep this before /:id so "summary" is not treated as an ID.
*/

router.get("/summary", getBedSummary);

/*
|--------------------------------------------------------------------------
| Bed Assignment Actions
|--------------------------------------------------------------------------
*/

router.put("/:id/assign", assignBed);
router.put("/:id/release", releaseBed);

/*
|--------------------------------------------------------------------------
| Bed CRUD
|--------------------------------------------------------------------------
*/

router.get("/", getBeds);
router.post("/", createBed);

router.get("/:id", getBed);
router.put("/:id", updateBed);
router.delete("/:id", deleteBed);

module.exports = router;