const mongoose = require("mongoose")

const plannerSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Users",
            required : true
        },

        weekStart : {
            type : Date,
            required : true
        },
        
        weekEnd : {
            type : Date,
            required : true
        },
        
        totalBudget : {
            type : Number,
            required : true
        },

        categories : [
            {
                category : {
                    type : String,
                    required : true
                },

                plannedAmount : {
                    type : Number,
                    required : true
                }
            }
        ]
    },
    {
        timestamps : true
    }
);

module.exports = mongoose.model("Planner", plannerSchema);