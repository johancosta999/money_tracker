const Transaction = require("../model/transactionsModel")

const getDashboardSummary = async(req, res) => {
    try{
        //get all transactions belonging to a logged user
        const transactions = await Transaction.find({
            userId : req.userId
        });

        let totalIncome = 0;
        let totalExpense = 0;

        //calculate income and expenses
        transactions.forEach((transaction) =>{
            
        if(transaction.type === "income"){
            totalIncome += transaction.amount;
        }

        if(transaction.type === "expense"){
            totalExpense += transaction.amount;
        }
        
    });

    //calculate balance 
    const balance = totalIncome - totalExpense;

    res.status(200).json({
        totalIncome,
        totalExpense,
        balance
    })

    } catch(error){
        res.status(500).json({
            message : "Couldn't get deshboard summary",
            error : error.message
        })
    }
};


module.exports = {
    getDashboardSummary
}