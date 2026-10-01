const bankTransfer = require('../model/bankTransfersModel')

// Fields a user is allowed to set on a bank transaction
const pickEditableFields = (body) => {
    const fields = {};
    ['type', 'amount', 'description', 'external', 'date'].forEach((key) => {
        if (body[key] !== undefined) fields[key] = body[key];
    });

    // Withdrawals only move your own money, so they never affect the balance
    if (fields.type === 'Withdraw') fields.external = false;

    return fields;
};

const createBankTransfer = async(req, res) => {
    try{
        const newTransfer = new bankTransfer({
            ...pickEditableFields(req.body),
            userId : req.userId
        });

        const transfer = await newTransfer.save()
        res.status(200).json(transfer)

    } catch (error) {
        console.error(error);
        console.log('Counldnt create transfer');
        res.status(500).json({
            message: 'Counldnt create transfer',
        })
       
    }
};

const getAllBankTransactions = async(req, res) => {
    try {
        const bankTransaction = await bankTransfer.find({
            userId: req.userId
        })

        if(!bankTransaction) {
            return res.status(404).json({
                message: 'Unable to find any transaction'
            })
        };

        res.status(201).json(bankTransaction)

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : 'Unable to get all transactions',
        });

    }
};

const getBankTransaction = async(req, res) => {
    try {
        const { id } = req.params;

        const transaction = await bankTransfer.findOne({
            _id :id,
            userId: req.userId
        });

        if(!transaction) {
            return res.status(404).json({
                message: 'Unable to get the transaction'
            })
        };

        res.status(200).json(transaction)

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to get to the transaction',
        })

    }
};

const updateBankTransaction = async(req, res) => {
    try{
        const { id } = req.params;

        const updateTransaction = await bankTransfer.findOneAndUpdate({
            _id:id,
            userId: req.userId
        },
        pickEditableFields(req.body),
        {
            new: true,
            runValidators: true
        }
    )

        if(!updateTransaction) {
            return res.status(404).json({
                message: "Unable to find the transaction"
            })
        };

        res.status(200).json(updateTransaction)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to update transaction',
        })

    }
};

const deleteBankTransaction = async(req, res) => {
    try {
        const { id } = req.params;

        const bankTransaction = await bankTransfer.findOneAndDelete({
            _id: id,
            userId: req.userId
        })

        if(!bankTransaction) {
            return res.status(404).json({
                message: "Couldnt find the transaction"
            })
        };

        res.status(200).json({
            message: "Transaction succesfully deleted",
            "deletedTransaction" : bankTransaction
        })

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to delete transaction',
        })

    }
}

module.exports = {
    createBankTransfer,
    getAllBankTransactions,
    getBankTransaction,
    updateBankTransaction,
    deleteBankTransaction
};