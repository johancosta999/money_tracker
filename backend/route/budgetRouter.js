const express = require("express")

const router  = express.Router()

const {
    createBudget,
    getBudgets,
    getBudget,
    updateBudget,
    deleteBudget
} = require("../controller/budgetController")

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/:id", getBudget);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;