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
        },

        age: {
            type: Number,
            required: true,
        }
    },

    {
        timestamps: Date
    }
);

module.exports = mongoose.model("Users", userSchema)