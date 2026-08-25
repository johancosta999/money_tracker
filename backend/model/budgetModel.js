const mongoose = require("mongoose")

const budgetSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },

        title : {
            type : String,
            required : true
        },

        amount : {
            type : Number,
            required : true
        },

        duration : {
            type : String,
            required : true
        }
    },

    {
        timestamps :true
    }
);

module.exports = mongoose.model("Budget", budgetSchema)