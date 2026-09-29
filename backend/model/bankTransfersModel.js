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
        required: true,
        min: 0.01
    },

    // true = money came from / went to someone else (affects current balance)
    // false = moving your own money (no effect on current balance)
    external: {
        type: Boolean,
        default: false
    },

    date: {
        type: Date,
        default: Date.now
    },

    description : {
        type: String,
        trim : true
    },

}, { timestamps: true});

module.exports = mongoose.model("bankTransfers", bankTransfersSchema);