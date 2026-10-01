const Budget = require("../model/budgetModel")
const { isValidAmount } = require("../utils/validation")

const createBudget = async(req, res) => {
    try {
        const { title, amount, duration } = req.body;

        if (!isValidAmount(amount)) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        const newBudget = new Budget({
            userId : req.userId,
            title,
            amount,
            duration
        });

        const budget = await newBudget.save();
        res.status(201).json(budget)

    } catch(error){
        console.error(error);
        res.status(500).json({
            message : "Couldn't create budget.",
        });
    }
};

const getBudgets = async(req, res) => {
    try{
        const budget = await Budget.find({
            userId : req.userId
        })

        if(!budget) {
            return res.status(404).json({
                message : "Couldn't find budget"
            })
        }

        res.status(200).json(budget)

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn't get budgets",
        })
    }
};

const getBudget = async(req, res) => {
    try {
        const { id } = req.params;
        
        const findBudget = await Budget.findOne({
            _id: id,
            userId: req.userId
        });

        if(!findBudget) {
            return res.status(404).json({
                message : "Couldn't find the user"
            })
        }

        res.status(200).json(findBudget);

    } catch(error){
        console.error(error);
        res.status(500).json({
            message : "Couldnt get the budget",
        })
    }
};

const updateBudget = async(req, res) => {
    try {
        const { id } = req.params;

        // Only these fields are editable; userId must never change
        const updates = {};
        ["title", "amount", "duration"].forEach((key) => {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        });

        if (updates.amount !== undefined && !isValidAmount(updates.amount)) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        const updatedBudget = await Budget.findOneAndUpdate({
                _id : id,
                userId : req.userId
            },
            updates,
            { new: true, runValidators: true }
        );

        if(!updatedBudget) {
            return res.status(404).json({
                message : "Couldm'y get the user"
            })
        }

        res.status(200).json(updatedBudget)

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn't update user",
        })
    }
};

const deleteBudget = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedBudget = await Budget.findOneAndDelete({
            _id : id,
            userId: req.userId
        });

        if(!deletedBudget) {
            return res.status(404).json({
                message : "Couldn't find the budget"
            })
        }

        res.status(200).json({deletedBudget})

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : "Couldn' t delete the budget",
        })
    }
};


module.exports = {
    createBudget,
    getBudgets,
    getBudget,
    updateBudget,
    deleteBudget
}