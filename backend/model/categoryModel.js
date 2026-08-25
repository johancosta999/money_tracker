const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null
    },

    isDefault: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema)