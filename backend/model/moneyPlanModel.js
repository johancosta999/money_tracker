const mongoose = require("mongoose")

const weeklySchema = new mongoose.Schema(
        {
            weekNumber: {
                type : Number,
                required: true
            },

            startDate: {
                type: Date,
                required: true
            },

            endDate: {
                type: Date,
                required: true
            },

            budget: {
                type : Number,
                required: true,
                default: 0
            }
        },

        {
            _,
            _id: true
        }
    );

    const plannerSchema = new mongoose.Schema({
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },

        name : {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum : ["monthly", "weekly", "yearly"],
            default: "monthly"
        }, 

        startDate : {
            type: Date,
            required: true
        },
        
        endDate: {
            type: Date,
            required: true
        },

        totalBudget : {
            type: Number,
            required: true,
            min : 0
        },

        categories: [
            {
                type: String,
                trim: true
            }
        ],

        weeks: [weeklySchema],

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Planner", plannerSchema);