const Transaction = require("../model/transactionsModel")

const createTransaction = async(req, res) => {
    try{
        const { title, amount, type, category, date, description } = req.body;

        const newTransaction = new Transaction(
            {
                userId: req.userId,
                title,
                amount,
                type,
                category,
                date,
                description
            }
        );

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction)

    } catch (error){
        res.status(500).json({
            message: "Coundn't create transaction",
            error : error.message
        })
    };
};

const getTransactions = async(req, res) => {
    try{
        const transactions = await Transaction.find({
            userId : req.userId
        });

        if(!transactions) {
            return res.status(404).json({
                message : "Could find any transaction"
            })
        }

        res.status(200).json(transactions)

    } catch (error) {
        res.status(500).json({
            message: "Couldn't load transactions",
            error : error.message
        })
    };
};

const getTransaction = async(req, res) => {
    try{
        const { id } = req.params;

        const transaction = await Transaction.findOne({
            _id: id,
            userId: req.userId
        });

        if(!transaction){
            return res.status(404).json({
                message : "No transaction found"
            })
        }

        res.status(200).json(transaction)

    } catch (error ){
        res.status(500).json({
            message : "Coundn't load the transaction",
            error : error.message
        })
    }
};

const updateTransaction = async(req, res) => {
    try{
        const { id } = req.params;

        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: id,
                userId: req.userId
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if(!transaction) {
            return res.status(404).json({
                message : "Couldn't find transaction"
            })
        }

        res.status(200).json(transaction)

    } catch (error){
        res.status(500).json({
            message : "Couldn't update transaction",
            error : error.message 
        })
    }
};

const deleteTransaction = async(req, res) => {
    try{
        const { id } = req.params;

        const transaction = await Transaction.findByIdAndDelete({
            _id: id,
            userId : req.userId
        });

        if(!transaction) {
            return res.status(404).json({
                messgae : "Couldn't find transaction"
            })
        }

        res.status(200).json(
            {deletedTransacion : transaction}
        )

    } catch (error) {
        res.status(500).json({
            message : "Couldn't delete transaction",
            error : error.message
        })
    }
}

module.exports = { createTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction }