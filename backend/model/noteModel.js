const mongoose = require('mongoose')

// Longest note a user can save; keeps notes short and stops huge strings
const NOTE_MAX_LENGTH = 500;

const noteSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        // Every query filters by user, so index it
        index: true
    },

    text : {
        type: String,
        required: true,
        trim: true,
        maxlength: NOTE_MAX_LENGTH
    },

}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
module.exports.NOTE_MAX_LENGTH = NOTE_MAX_LENGTH;
