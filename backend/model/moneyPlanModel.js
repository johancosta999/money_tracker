const mongoose = require("mongoose")

const plannerSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },

        weekStart : {
            type : Date,
            required : true
        },
        
        weekEnd : {
            type : Date,
            requied : true
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