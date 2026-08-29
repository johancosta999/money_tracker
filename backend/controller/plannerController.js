const Planner = require("../model/moneyPlanModel")
const Transaction = require("../model/transactionsModel")

// =====================================================
// CREATE MONTHLY PLANNER
// =====================================================

const createPlan = async (req, res) => {

    try {

        const {
            name,
            startDate,
            totalBudget,
            categories
        } = req.body;

        if (!name || !startDate || totalBudget === undefined) {
            return res.status(400).json({
                message: "Name, start date and total budget are required"
            });
        }

        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
            return res.status(400).json({
                message: "Invalid start date"
            });
        }


        // 30-day planner period
        const end = new Date(start);

        end.setDate(end.getDate() + 30);


        // =============================================
        // CHECK FOR OVERLAPPING PLANNERS
        // =============================================

        const overlappingPlanner = await Planner.findOne({
            userId: req.userId,

            startDate: {
                $lt: end
            },

            endDate: {
                $gt: start
            }
        });

        if (overlappingPlanner) {

            return res.status(400).json({
                message: "This planner overlaps with an existing planner"
            });

        }


        // =============================================
        // CREATE 4 WEEKS
        // =============================================

        const weeks = [];

        for (let i = 0; i < 4; i++) {

            const weekStart = new Date(start);

            weekStart.setDate(
                weekStart.getDate() + (i * 7)
            );


            const weekEnd = new Date(weekStart);

            weekEnd.setDate(
                weekEnd.getDate() + 6
            );


            weeks.push({
                weekNumber: i + 1,
                startDate: weekStart,
                endDate: weekEnd,
                budget: 0
            });
        }


        // =============================================
        // BONUS DAYS
        // =============================================

        const bonusStart = new Date(start);

        bonusStart.setDate(
            bonusStart.getDate() + 28
        );


        const bonusEnd = new Date(end);

        bonusEnd.setDate(
            bonusEnd.getDate() - 1
        );


        const planner = await Planner.create({

            userId: req.userId,

            name,

            startDate: start,

            endDate: end,

            totalBudget: Number(totalBudget),

            categories: categories || [],

            weeks,

            bonusDays: {
                startDate: bonusStart,
                endDate: bonusEnd
            }

        });


        res.status(201).json({
            message: "Planner created successfully",
            planner
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Couldn't create planner",
            error: error.message
        });

    }

};

const getPlans = async(req, res) => {
    try{
        const plans = await Planner.find({
            userId : req.userId
        });

        if(!plans) {
            return res.status(404).json({
                message : "Couldn't get plans"
            })
        };

        res.status(200).json(plans)

    } catch(error) {
        res.status(500).json({
            message : "Couldn't get plans",
            error : error.message
        })
    }
};

const getPlan = async(req, res) => {
    try{
        const { id } = req.params;

        const plan = await Planner.findOne({
            _id: id,
            userId: req.userId
        });

        if(!plan) {
            return res.status(404).json({
                message : "Couldn't find plan"
            })
        };

        res.status(200).json(plan)

    } catch(error){
        res.status(500).json({
            message : "Couldn'y get the plan",
            error : error.message
        })
    }
};

// =====================================================
// UPDATE PLANNER
// =====================================================

const updatePlan = async (req, res) => {

    try {

        const {
            name,
            totalBudget,
            categories
        } = req.body;


        const planner = await Planner.findOne({
            _id: req.params.id,
            userId: req.userId
        });


        if (!planner) {

            return res.status(404).json({
                message: "Planner not found"
            });

        }


        if (name !== undefined) {
            planner.name = name;
        }


        if (totalBudget !== undefined) {
            planner.totalBudget = Number(totalBudget);
        }


        if (categories !== undefined) {
            planner.categories = categories;
        }


        await planner.save();


        res.status(200).json({
            message: "Planner updated successfully",
            planner
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Couldn't update planner",
            error: error.message
        });

    }

};

// =====================================================
// DELETE PLANNER
// =====================================================

const deletePlan = async (req, res) => {

    try {

        const planner = await Planner.findOne({
            _id: req.params.id,
            userId: req.userId
        });


        if (!planner) {

            return res.status(404).json({
                message: "Planner not found"
            });

        }


        // Delete transactions belonging to this planner
        await Transaction.deleteMany({
            plannerId: planner._id,
            user: req.userId
        });


        await planner.deleteOne();


        res.status(200).json({
            message: "Planner deleted successfully"
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Couldn't delete planner",
            error: error.message
        });

    }

};

// =====================================================
// UPDATE WEEKLY BUDGET
// =====================================================

const updateWeekBudget = async (req, res) => {

    try {

        const {
            budget
        } = req.body;


        const planner = await Planner.findOne({
            _id: req.params.id,
            userId: req.userId
        });


        if (!planner) {

            return res.status(404).json({
                message: "Planner not found"
            });

        }


        const week = planner.weeks.id(
            req.params.weekId
        );


        if (!week) {

            return res.status(404).json({
                message: "Week not found"
            });

        }


        if (budget === undefined || Number(budget) < 0) {

            return res.status(400).json({
                message: "Valid weekly budget is required"
            });

        }


        // =============================================
        // CHECK PREVIOUS WEEK SPENDING
        // =============================================

        if (week.weekNumber > 1) {

            const previousWeek =
                planner.weeks.find(
                    w =>
                        w.weekNumber ===
                        week.weekNumber - 1
                );


            if (previousWeek) {

                const previousSpent =
                    await getWeekExpense(
                        planner._id,
                        previousWeek.startDate,
                        previousWeek.endDate
                    );


                const previousRemaining =
                    previousWeek.budget -
                    previousSpent;


                // =====================================
                // AVAILABLE BUDGET
                // =====================================

                const availableBudget =
                    planner.totalBudget -
                    getTotalAssignedWeeklyBudget(
                        planner,
                        week._id
                    );


                if (
                    Number(budget) >
                    availableBudget
                ) {

                    return res.status(400).json({
                        message:
                            "Weekly budget exceeds the remaining planner budget"
                    });

                }

            }

        }


        week.budget = Number(budget);


        await planner.save();


        res.status(200).json({
            message: "Weekly budget updated",
            week
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Couldn't update weekly budget",
            error: error.message
        });

    }

};


// =====================================================
// GET PLANNER SUMMARY
// =====================================================

const getPlanSummary = async (req, res) => {

    try {

        const planner = await Planner.findOne({
            _id: req.params.id,
            userId: req.userId
        });


        if (!planner) {

            return res.status(404).json({
                message: "Planner not found"
            });

        }


        const weeklySummary = [];


        for (const week of planner.weeks) {

            const spent = await getWeekExpense(
                planner._id,
                week.startDate,
                week.endDate
            );


            const remaining =
                week.budget - spent;


            weeklySummary.push({

                weekNumber: week.weekNumber,

                startDate: week.startDate,

                endDate: week.endDate,

                budget: week.budget,

                spent,

                remaining,

                status:
                    remaining < 0
                        ? "over_budget"
                        : "within_budget"

            });

        }


        const totalSpent =
            await getPlannerExpense(
                planner._id
            );


        const remainingBudget =
            planner.totalBudget -
            totalSpent;


        res.status(200).json({

            planner: {
                id: planner._id,
                name: planner.name,
                startDate: planner.startDate,
                endDate: planner.endDate,
                totalBudget: planner.totalBudget
            },

            totalSpent,

            remainingBudget,

            weeklySummary

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Couldn't get planner summary",
            error: error.message
        });

    }

};


// =====================================================
// HELPER: GET WEEK EXPENSE
// =====================================================

const getWeekExpense = async (
    plannerId,
    startDate,
    endDate
) => {

    const result =
        await Transaction.aggregate([

            {
                $match: {

                    plannerId,

                    type: "expense",

                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }

                }
            },

            {
                $group: {

                    _id: null,

                    total: {
                        $sum: "$amount"
                    }

                }

            }

        ]);


    return result.length > 0
        ? result[0].total
        : 0;

};


// =====================================================
// HELPER: GET TOTAL PLANNER EXPENSE
// =====================================================

const getPlannerExpense = async (
    plannerId
) => {

    const result =
        await Transaction.aggregate([

            {
                $match: {

                    plannerId,

                    type: "expense"

                }
            },

            {
                $group: {

                    _id: null,

                    total: {
                        $sum: "$amount"
                    }

                }

            }

        ]);


    return result.length > 0
        ? result[0].total
        : 0;

};


// =====================================================
// HELPER: TOTAL ASSIGNED WEEKLY BUDGET
// =====================================================

const getTotalAssignedWeeklyBudget = (
    planner,
    currentWeekId
) => {

    return planner.weeks
        .filter(
            week =>
                week._id.toString() !==
                currentWeekId.toString()
        )
        .reduce(
            (total, week) =>
                total + Number(week.budget || 0),
            0
        );

};


module.exports = {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan,
    updateWeekBudget,
    getPlanSummary
};