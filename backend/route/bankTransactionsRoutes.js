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

router.post('/create-transaction', createBankTransfer, protect);
router.get('/bank-transactions', getAllBankTransactions, protect);
router.get('/bank-transaction/:id', getBankTransaction, protect);
router.put('/update-transaction/:id', updateBankTransaction, protect);
router.delete('/delete-transaction/:id', deleteBankTransaction, protect);

module.exports= router;