const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(

    {
        userName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            // Never returned by queries unless asked for with .select("+password"),
            // so the hash can't accidentally be sent to the browser
            select: false
        },

        age: {
            type: Number,
            required: true,
        },

        // When the user last reset their dashboard totals to zero.
        // Dashboard totals only count transactions created after this time;
        // older transactions are kept, just not added up.
        totalsResetAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Users", userSchema)