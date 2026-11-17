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

    // Optional: the planner this bank transaction belongs to (null = no planner)
    plannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Planner",
        default: null
    },

    // Optional spending category, same names as normal transactions ("" = none)
    category: {
        type: String,
        trim: true,
        maxlength: 50,
        default: ""
    },

    description : {
        type: String,
        trim : true
    },

}, { timestamps: true});

// Every list/total query filters by user and sorts by date
bankTransfersSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("bankTransfers", bankTransfersSchema);