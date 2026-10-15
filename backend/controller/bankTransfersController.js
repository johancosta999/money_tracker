const mongoose = require('mongoose')
const bankTransfer = require('../model/bankTransfersModel')
const Planner = require('../model/moneyPlanModel')

// Note: 500 responses only send a generic message. The real error is logged
// with console.error on the server, so database details never reach the browser.

// Fields a user is allowed to set on a bank transaction
const pickEditableFields = (body) => {
    const fields = {};
    ['type', 'amount', 'description', 'external', 'date', 'plannerId'].forEach((key) => {
        if (body[key] !== undefined) fields[key] = body[key];
    });

    // Withdrawals only move your own money, so they never affect the balance
    if (fields.type === 'Withdraw') fields.external = false;

    return fields;
};

// The planner is optional. Empty / null means "no planner".
// Otherwise it must be one of the user's own planners, so nobody can link to someone else's.
// Returns an error message, or null when the plannerId is OK.
const checkPlanner = async (req) => {
    const { plannerId } = req.body;

    if (plannerId === undefined) return null;

    if (plannerId === null || plannerId === '') {
        req.body.plannerId = null;
        return null;
    }

    if (!mongoose.isValidObjectId(plannerId)) {
        return 'Selected planner not found';
    }

    const exists = await Planner.exists({ _id: plannerId, userId: req.userId });
    return exists ? null : 'Selected planner not found';
};

const createBankTransfer = async(req, res) => {
    try{
        const plannerError = await checkPlanner(req);
        if (plannerError) {
            return res.status(404).json({ message: plannerError });
        }

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
        // Include the planner's name so the list can show and filter by it
        const bankTransaction = await bankTransfer.find({
            userId: req.userId
        }).populate('plannerId', 'name')

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

        const plannerError = await checkPlanner(req);
        if (plannerError) {
            return res.status(404).json({ message: plannerError });
        }

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