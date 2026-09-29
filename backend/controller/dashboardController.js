const Transaction = require("../model/transactionsModel");
const BankTransfer = require("../model/bankTransfersModel");

const getDashboardSummary = async (req, res) => {
    try {

        const [transactions, bankTransactions] = await Promise.all([
            Transaction.find({ user: req.userId }),
            BankTransfer.find({ userId: req.userId })
        ]);

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

        // Only money coming from / going to someone else changes the balance.
        // Withdrawals just move your own money, so they are always ignored.
        let bankIn = 0;
        let bankOut = 0;

        // Net money in/out of the bank account, counting every bank transaction
        let bankNet = 0;

        bankTransactions.forEach((bankTransaction) => {

            if (bankTransaction.type === "Deposit") {
                bankNet += bankTransaction.amount;

                if (bankTransaction.external) {
                    bankIn += bankTransaction.amount;
                }
            } else {
                bankNet -= bankTransaction.amount;

                if (bankTransaction.type === "Transfer" && bankTransaction.external) {
                    bankOut += bankTransaction.amount;
                }
            }

        });

        const balance = totalIncome - totalExpense + bankIn - bankOut;

        res.status(200).json({
            totalIncome,
            totalExpense,
            bankIn,
            bankOut,
            bankNet,
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
