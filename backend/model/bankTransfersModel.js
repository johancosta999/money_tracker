const mongoose = require('mongoose')

const bankTransfersSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    type : {
        type: String,
        enum: ["Deposit", "Withdraw", "Transfer"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    description : {
        type: String,
        trim : true
    },

}, { timestamps: true});

module.exports = mongoose.model("bankTransfers", bankTransfersSchema);