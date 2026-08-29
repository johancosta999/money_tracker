const Transaction = require("../model/transactionsModel");
const Planner = require("../model/moneyPlanModel")

// =====================================================
// CREATE TRANSACTION
// =====================================================

const createTransaction = async (req, res) => {

    try {

        const {
            title,
            amount,
            type,
            category,
            date,
            description,
            plannerId
        } = req.body;


        // ---------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------

        if (
            !title ||
            amount === undefined ||
            !type ||
            !category ||
            !description
        ) {

            return res.status(400).json({
                message: "All required fields must be provided"
            });

        }


        // ---------------------------------------------
        // FIND PLANNER
        // ---------------------------------------------

        let planner;


        // If user manually selected a planner
        if (plannerId) {

            planner = await Planner.findOne({
                _id: plannerId,
                userId: req.userId
            });


            if (!planner) {

                return res.status(404).json({
                    message: "Selected planner not found"
                });

            }

        } else {

            // -----------------------------------------
            // AUTOMATICALLY FIND ACTIVE PLANNER
            // -----------------------------------------

            const transactionDate = date
                ? new Date(date)
                : new Date();


            planner = await Planner.findOne({

                userId: req.userId,

                startDate: {
                    $lte: transactionDate
                },

                endDate: {
                    $gt: transactionDate
                }

            }).sort({
                startDate: -1
            });


            if (!planner) {

                return res.status(400).json({
                    message:
                        "No active planner found. Please select a planner."
                });

            }

        }


        // ---------------------------------------------
        // CHECK TRANSACTION DATE
        // ---------------------------------------------

        const transactionDate = date
            ? new Date(date)
            : new Date();


        if (isNaN(transactionDate.getTime())) {

            return res.status(400).json({
                message: "Invalid transaction date"
            });

        }


        // Transaction must belong to the planner period
        if (
            transactionDate < planner.startDate ||
            transactionDate >= planner.endDate
        ) {

            return res.status(400).json({
                message:
                    "Transaction date is outside the selected planner period"
            });

        }


        // ---------------------------------------------
        // CREATE TRANSACTION
        // ---------------------------------------------

        const transaction = await Transaction.create({

            user: req.userId,

            plannerId: planner._id,

            title,

            amount: Number(amount),

            type,

            category,

            date: transactionDate,

            description

        });


        res.status(201).json({

            message: "Transaction created successfully",

            transaction

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Couldn't create transaction",

            error: error.message

        });

    }

};


// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

const getTransactions = async (req, res) => {

    try {

        const filter = {
            user: req.userId
        };


        // Optional planner filter
        if (req.query.plannerId) {

            filter.plannerId =
                req.query.plannerId;

        }


        const transactions =
            await Transaction.find(filter)
                .populate("plannerId", "name")
                .sort({
                    date: -1
                });


        res.status(200).json(
            transactions
        );


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Couldn't get transactions",

            error: error.message

        });

    }

};


// =====================================================
// GET SINGLE TRANSACTION
// =====================================================

const getTransaction = async (req, res) => {

    try {

        const transaction =
            await Transaction.findOne({

                _id: req.params.id,

                user: req.userId

            })
            .populate("plannerId", "name");


        if (!transaction) {

            return res.status(404).json({

                message: "Transaction not found"

            });

        }


        res.status(200).json(
            transaction
        );


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Couldn't get transaction",

            error: error.message

        });

    }

};


// =====================================================
// UPDATE TRANSACTION
// =====================================================

const updateTransaction = async (req, res) => {

    try {

        const {
            title,
            amount,
            type,
            category,
            date,
            description,
            plannerId
        } = req.body;


        const transaction =
            await Transaction.findOne({

                _id: req.params.id,

                user: req.userId

            });


        if (!transaction) {

            return res.status(404).json({

                message: "Transaction not found"

            });

        }


        // ---------------------------------------------
        // HANDLE PLANNER CHANGE
        // ---------------------------------------------

        if (plannerId) {

            const planner =
                await Planner.findOne({

                    _id: plannerId,

                    userId: req.userId

                });


            if (!planner) {

                return res.status(404).json({

                    message:
                        "Selected planner not found"

                });

            }


            transaction.plannerId =
                planner._id;

        }


        // ---------------------------------------------
        // UPDATE FIELDS
        // ---------------------------------------------

        if (title !== undefined) {
            transaction.title = title;
        }

        if (amount !== undefined) {
            transaction.amount =
                Number(amount);
        }

        if (type !== undefined) {
            transaction.type = type;
        }

        if (category !== undefined) {
            transaction.category =
                category;
        }

        if (description !== undefined) {
            transaction.description =
                description;
        }


        if (date !== undefined) {

            const newDate =
                new Date(date);


            if (isNaN(newDate.getTime())) {

                return res.status(400).json({

                    message:
                        "Invalid transaction date"

                });

            }


            transaction.date = newDate;

        }


        // ---------------------------------------------
        // CHECK DATE AGAINST PLANNER
        // ---------------------------------------------

        const planner =
            await Planner.findOne({

                _id: transaction.plannerId,

                userId: req.userId

            });


        if (!planner) {

            return res.status(404).json({

                message:
                    "Transaction planner not found"

            });

        }


        if (
            transaction.date < planner.startDate ||
            transaction.date >= planner.endDate
        ) {

            return res.status(400).json({

                message:
                    "Transaction date is outside the planner period"

            });

        }


        await transaction.save();


        res.status(200).json({

            message:
                "Transaction updated successfully",

            transaction

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Couldn't update transaction",

            error: error.message

        });

    }

};


// =====================================================
// DELETE TRANSACTION
// =====================================================

const deleteTransaction = async (req, res) => {

    try {
        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                user: req.userId
            });

        if (!transaction) {
            return res.status(404).json({
                message:
                    "Transaction not found"
            });
        }

        await transaction.deleteOne();
        res.status(200).json({
            message:
                "Transaction deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:
                "Couldn't delete transaction",
            error: error.message
        });
    }

};


module.exports = {
    createTransaction,
    getTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction
};
