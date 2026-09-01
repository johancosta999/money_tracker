const Transaction = require("../model/transactionsModel");

const getDashboardSummary = async (req, res) => {
    try {

        const transactions = await Transaction.find({
            user: req.userId
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((transaction) => {

            if (transaction.type === "income") {
                totalIncome += transaction.amount;
            }

            if (transaction.type === "expense") {
                totalExpense += transaction.amount;
            }

        });

        const balance = totalIncome - totalExpense;

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance
        });

    } catch (error) {

        res.status(500).json({
            message: "Couldn't get dashboard summary",
            error: error.message
        });

    }
};

module.exports = {
    getDashboardSummary
};