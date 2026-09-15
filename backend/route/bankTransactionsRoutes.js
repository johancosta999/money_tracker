const express = require('express')
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
    createBankTransfer,
    getAllBankTransactions,
    getBankTransaction,
    updateBankTransaction,
    deleteBankTransaction
} = require('../controller/bankTransfersController')

router.post('/create-transaction',protect, createBankTransfer);
router.get('/bank-transactions', protect, getAllBankTransactions);
router.get('/bank-transaction/:id', protect, getBankTransaction);
router.put('/update-transaction/:id', protect, updateBankTransaction);
router.delete('/delete-transaction/:id', protect, deleteBankTransaction);

module.exports= router;