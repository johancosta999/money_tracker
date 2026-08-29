const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan,
    updateWeekBudget,
    getPlanSummary
} = require("../controller/plannerController");


router.post("/", protect, createPlan);

router.get("/", protect, getPlans);

router.get("/:id", protect, getPlan);

router.put("/:id", protect, updatePlan);

router.delete("/:id", protect, deletePlan);


// Weekly budget
router.put(
    "/:id/weeks/:weekId",
    protect,
    updateWeekBudget
);


// Planner summary
router.get(
    "/:id/summary",
    protect,
    getPlanSummary
);


module.exports = router;