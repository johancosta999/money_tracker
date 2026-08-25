const Planner = require("../model/moneyPlanModel")
const Transactions = require("../model/transactionsModel")

const createPlan = async(req,res) => {
    try{
        const { weekStart, weekEnd, totalBudget, categories } = req.body;

        const newPlanner = new Planner({
            userId : req.userId,
            weekStart,
            weekEnd,
            totalBudget,
            categories
        })

        const planner = await newPlanner.save()

        res.status(201).json(planner)

    } catch(error) {
        res.status(500).json({
            message  : "Couldn't create plan",
            error : error.message
        })
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

const updatePlan = async(req, res) => {
    try {
        const { id } = req.params;

        const updatedPlan = await Planner.findOneAndUpdate(
            {
                _id: id,
                userId: req.userId
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if(!updatedPlan) {
            return res.status(404).json({
                message : "Couldn't find the plan"
            })
        }
        
        res.status(200).json(updatedPlan)

    } catch(error){
        res.status(500).json({
            message : "Couldn't update the plan",
            error : error.message
        })
    }
};

const deletePlan = async(req, res) =>{
    try {
        const { id } = req.params;

        const deletedPlan = await Planner.findOneAndDelete({
            _id : id,
            userId: req.userId
        });

        if(!deletedPlan) {
            return res.status(404).json({
                messgae : "Couldn't find the plan"
            })
        }

        res.status(200).json(deletedPlan)

    } catch(error) {
        res.status(500).json({
            message : "Couln't delete the plan",
            error : error.message
        })
    }
};

const getPlanSummary = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the plan belonging to the logged-in user
        const plan = await Planner.findOne({
            _id: id,
            userId: req.userId
        });

        if (!plan) {
            return res.status(404).json({
                message: "Couldn't find the plan"
            });
        }

        // Find expenses within the planned week
        const transactions = await Transactions.find({
            userId: req.userId,
            type: "expense",
            date: {
                $gte: plan.weekStart,
                $lte: plan.weekEnd
            }
        });

        // Calculate actual spending for each category
        const categoryActuals = {};

        transactions.forEach((transaction) => {

            if (!categoryActuals[transaction.category]) {
                categoryActuals[transaction.category] = 0;
            }

            categoryActuals[transaction.category] += transaction.amount;
        });

        // Compare planned vs actual
        const categories = plan.categories.map((item) => {

            const actual = categoryActuals[item.category] || 0;

            const remaining = item.plannedAmount - actual;

            return {
                category: item.category,
                planned: item.plannedAmount,
                actual,
                remaining
            };
        });

        // Calculate total actual spending
        const actual = transactions.reduce(
            (total, transaction) => total + transaction.amount,
            0
        );

        const remaining = plan.totalBudget - actual;

        const percentageUsed =
            plan.totalBudget > 0
                ? (actual / plan.totalBudget) * 100
                : 0;

        res.status(200).json({
            weekStart: plan.weekStart,
            weekEnd: plan.weekEnd,
            planned: plan.totalBudget,
            actual,
            remaining,
            percentageUsed: Number(percentageUsed.toFixed(2)),
            categories
        });

    } catch (error) {

        res.status(500).json({
            message: "Couldn't get plan summary",
            error: error.message
        });

    }
};

module.exports = {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan,
    getPlanSummary
}; 