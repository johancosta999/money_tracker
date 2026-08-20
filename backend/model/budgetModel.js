const mongoose = require("mongoose")

const budgetSchema = new mongoose.Schema(
    {
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
        timestamp : {
            type : Date.now
        }
    }
);

module.exports = mongoose.model("Budget", budgetSchema)