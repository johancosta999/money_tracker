const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware")

const { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction } = require("../controller/transactionsController");

router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions)
router.get("/:id", protect, getTransaction)
router.put("/:id", protect, updateTransaction)
router.delete("/:id", protect, deleteTransaction)

module.exports = router;