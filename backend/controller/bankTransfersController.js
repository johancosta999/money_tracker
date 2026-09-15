const bankTransfer = require('../model/bankTransfersModel')

const createBankTransfer = async(req, res) => {
    try{
        const {
            type,
            amount,
            description
        } = req.body;

        const newTransfer = new bankTransfer({
            userId : req.userId,
            type,
            amount,
            description
        });

        const transfer = await newTransfer.save()
        res.status(200).json(transfer)

    } catch (error) {
        console.log('Counldnt create transfer');
        res.status(500).json({
            message: 'Counldnt create transfer',
            error: message.error
        })
        process.exit(1);
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
        res.status(500).json({
            message : 'Unable to get all transactions',
            error: message.error
        });

        process.exit(1);
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
        res.status(500).json({
            message: 'Unable to get to the transaction',
            error: message.error
        })

        process.exit(1)
    }
};

const updateBankTransaction = async(req, res) => {
    try{
        const { id } = req.params;

        const updateTransaction = await bankTransfer.findByIdAndUpdate({
            _id:id,
            userId: userId
        },
        req.body,
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
        res.status(500).json({
            message: 'Unable to update transaction',
            error: message.error
        })

        process.exit(1)
    }
};

const deleteBankTransaction = async(req, res) => {
    try {
        const { id } = req.params;

        const bankTransaction = await bankTransfer.findByIdAndDelete({
            _id: id,
            userId: userId
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
        res.status(500).json({
            message: 'Unable to delete transaction',
            error: message.error
        })

        process.exit(1)
    }
}

module.exports = {
    createBankTransfer,
    getAllBankTransactions,
    getBankTransaction,
    updateBankTransaction,
    deleteBankTransaction
};