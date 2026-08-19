const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    title : {
        type : String,
        enum : ["Education", "Food", "Travel", "Shopping", "Bills", "Sanitoring", "Sports", "Debt", "Others"],
        required : true
    }
})

module.exports = mongoose.model("Category", categorySchema)