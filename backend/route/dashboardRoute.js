const express = require("express");

const router = express.Router()

const protect = require("../middleware/authMiddleware")

const { getDashboardSummary } = require("../controller/dashboardController")

router.get("/summary", protect, getDashboardSummary)

module.exports = router;