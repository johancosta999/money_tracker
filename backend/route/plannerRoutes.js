const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware")

const {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan,
    getPlanSummary
} = require("../controller/plannerController");

router.post("/", protect, createPlan),
router.get("/", protect, getPlans),
router.get("/:id/summary", getPlanSummary)
router.get("/:id", protect, getPlan);
router.put("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);


module.exports = router