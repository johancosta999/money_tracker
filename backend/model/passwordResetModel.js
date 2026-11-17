const mongoose = require("mongoose");

// One-time "forgot password" token. Only a SHA-256 hash of the token is stored,
// so a leaked database can't be used to reset anyone's password.
const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true
    },

    tokenHash: {
        type: String,
        required: true,
        unique: true
    },

    // MongoDB deletes the document automatically once this time passes (TTL index)
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
