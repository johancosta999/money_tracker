const express = require("express");

const router = express.Router()

const protect = require("../middleware/authMiddleware")

const { getDashboardSummary, getCategoryBreakdown } = require("../controller/dashboardController")

router.get("/summary", protect, getDashboardSummary)
router.get("/categories", protect, getCategoryBreakdown)

module.exports = router;