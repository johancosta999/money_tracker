const Transaction = require("../model/transactionsModel");
const BankTransfer = require("../model/bankTransfersModel");
const User = require("../model/userModel");

// Note: 500 responses only send a generic message. The real error is logged
// with console.error on the server, so database details never reach the browser.

const getDashboardSummary = async (req, res) => {
    try {

        // If the user reset their totals, only count what was added after the reset.
        // Older transactions still exist, they just aren't part of the totals.
        const user = await User.findById(req.userId).select("totalsResetAt");
        const totalsResetAt = user?.totalsResetAt || null;
        const afterReset = totalsResetAt
            ? { createdAt: { $gt: totalsResetAt } }
            : {};

        const [transactions, bankTransactions] = await Promise.all([
            Transaction.find({ user: req.userId, ...afterReset }),
            BankTransfer.find({ userId: req.userId, ...afterReset })
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
            balance,
            totalsResetAt
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Couldn't get dashboard summary",
        });

    }
};

module.exports = {
    getDashboardSummary
};
