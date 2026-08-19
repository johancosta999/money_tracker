const Budget = require("../model/budgetModel")

const createBudget = async(req, res) => {
    try {
        const { title, amount, duration } = req.body;

        const newBudget = new Budget({
            title,
            amount,
            duration
        });

        const budget = await newBudget.save();
        res.status(201).json(budget)

    } catch(error){
        res.status(500).json({
            message : "Couldn't create budget.",
            error : message.error
        });
    }
};

const getBudgets = async(req, res) => {
    try{
        const budget = await Budget.find()

        if(!budget) {
            return res.staus(404).json({
                message : "Couldn't find budget"
            })
        }

        res.status(200).json(budget)

    } catch(error) {
        res.staus(500).json({
            message : "Couldn't get budgets",
            error : message.error
        })
    }
};

const getBudget = async(req, res) => {
    try {
        const { id } = req.params;
        
        const findBudget = await Budget.findById(id);

        if(!findBudget) {
            return res.status(404).json({
                message : "Couldn't find the user"
            })
        }

        res.status(200).json(findBudget);

    } catch(error){
        res.status(500).json({
            message : "Couldnt get the budget",
            error : message.error
        })
    }
};

const updateBudget = async(req, res) => {
    try {
        const { id } = req.params;

        const updatedBudget = await Budget.findByIdAndUpdate(
            id, 
            req.body,
            { new: true, runValidators: true }
        )

        if(!updatedBudget) {
            return res.status(404).json({
                message : "Couldm'y get the user"
            })
        }

        res.status(200).json(updatedBudget)

    } catch(error) {
        res.status(500).json({
            message : "Couldn't update user",
            error : message.error
        })
    }
};

const deleteBudget = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedBudget = await Budget.findByIdAndDelete(id);

        if(!deletedBudget) {
            return res.status(404).json({
                message : "Couldn't find the budget"
            })
        }

        res.status(200).json({deletedBudget})

    } catch(error) {
        res.status(500).json({
            message : "Couldn' t delete the budget",
            error : message.error
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