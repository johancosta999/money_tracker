const mongoose = require("mongoose")

const transactionsSchema = new mongoose.Schema({

        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Users",
            required : true
        },

        plannerId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Planner",
            required : true
        },

        title : {
            type: String,
            required: true,
            trim : true
        },

        amount : {
            type: Number,
            required: true,
            min: 0
        },

        type: {
            type: String,
            enum: ["income", "expense"],
            required: true
        },

        category : {
            type : String,
            required : true,
            trim : true
        },

        date : {
            type : Date,
            default : Date.now
        },

        description : {
            type : String,
            required : true,
            trim : true
        }
    },
    {
        timestamps : true
    }

);

module.exports = mongoose.model("transaction", transactionsSchema)