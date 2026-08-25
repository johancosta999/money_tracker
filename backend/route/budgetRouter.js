const express = require("express")

const router  = express.Router()

const protect = require("../middleware/authMiddleware")

const {
    createBudget,
    getBudgets,
    getBudget,
    updateBudget,
    deleteBudget
} = require("../controller/budgetController")

router.post("/", protect, createBudget);
router.get("/", protect, getBudgets);
router.get("/:id", protect, getBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;