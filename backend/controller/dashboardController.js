const mongoose = require("mongoose");
const Transaction = require("../model/transactionsModel");
const BankTransfer = require("../model/bankTransfersModel");
const User = require("../model/userModel");

// Note: 500 responses only send a generic message. The real error is logged
// with console.error on the server, so database details never reach the browser.

// If the user reset their totals, only count what was added after the reset.
// Older transactions still exist, they just aren't part of the totals.
const getAfterResetFilter = async (userId) => {
    const user = await User.findById(userId).select("totalsResetAt");
    const totalsResetAt = user?.totalsResetAt || null;

    return {
        totalsResetAt,
        afterReset: totalsResetAt ? { createdAt: { $gt: totalsResetAt } } : {}
    };
};

// GET /api/dashboard/summary
// Totals are added up inside MongoDB ($group) instead of loading every
// transaction into memory, so the dashboard stays fast for big histories.
const getDashboardSummary = async (req, res) => {
    try {
        const { totalsResetAt, afterReset } = await getAfterResetFilter(req.userId);

        // aggregate() doesn't cast ids like find() does, so convert it here
        const userId = new mongoose.Types.ObjectId(req.userId);

        const [transactionTotals, bankTotals] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userId, ...afterReset } },
                { $group: { _id: "$type", total: { $sum: "$amount" } } }
            ]),
            BankTransfer.aggregate([
                { $match: { userId, ...afterReset } },
                {
                    $group: {
                        _id: { type: "$type", external: { $eq: ["$external", true] } },
                        total: { $sum: "$amount" }
                    }
                }
            ])
        ]);

        const typeTotal = (type) =>
            transactionTotals.find((row) => row._id === type)?.total || 0;

        const totalIncome = typeTotal("income");
        const totalExpense = typeTotal("expense");

        // Only money coming from / going to someone else changes the balance.
        // Withdrawals just move your own money, so they are always ignored.
        let bankIn = 0;
        let bankOut = 0;

        // Net money in/out of the bank account, counting every bank transaction
        let bankNet = 0;

        bankTotals.forEach(({ _id, total }) => {
            if (_id.type === "Deposit") {
                bankNet += total;
                if (_id.external) bankIn += total;
            } else {
                bankNet -= total;
                if (_id.type === "Transfer" && _id.external) bankOut += total;
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

// GET /api/dashboard/categories?plannerId=<id>
// Expense totals per category, biggest first, for the dashboard chart.
// Without a planner it follows the dashboard totals (respects a totals reset);
// with a planner it shows that planner's whole spending.
const getCategoryBreakdown = async (req, res) => {
    try {
        const { plannerId } = req.query;
        const userId = new mongoose.Types.ObjectId(req.userId);

        const match = { user: userId, type: "expense" };

        if (plannerId) {
            if (!mongoose.isValidObjectId(plannerId)) {
                return res.status(400).json({ message: "Invalid planner" });
            }
            // Filtering by user too means another user's planner id just returns nothing
            match.plannerId = new mongoose.Types.ObjectId(plannerId);
        } else {
            Object.assign(match, (await getAfterResetFilter(req.userId)).afterReset);
        }

        const rows = await Transaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json(
            rows.map((row) => ({ category: row._id, total: row.total, count: row.count }))
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Couldn't get category totals",
        });
    }
};

module.exports = {
    getDashboardSummary,
    getCategoryBreakdown
};
