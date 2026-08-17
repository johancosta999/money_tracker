const express = require("express");

const router = express.Router();

const { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction } = require("../controller/transactionsController");

router.post("/", createTransaction);
router.get("/", getTransactions)
router.get("/:id", getTransaction)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)

module.exports = router;