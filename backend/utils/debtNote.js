const Note = require("../model/noteModel");
const { NOTE_MAX_LENGTH } = require("../model/noteModel");
const { MAX_NOTES_PER_USER } = require("../controller/noteController");

// Money received as a debt (a loan) is saved as a note so it shows up as a
// reminder in the notification bell.

const isDebtCategory = (category) =>
    String(category || "").trim().toLowerCase() === "debt";

// Saves `text` as a note for the user. Returns true when a note was saved.
// Never throws: a note problem must not undo or fail the transaction that
// was already created.
const addDebtNote = async (userId, text) => {
    const noteText = String(text || "").trim().slice(0, NOTE_MAX_LENGTH);
    if (!noteText) return false;

    try {
        // Same per-user limit as notes added by hand
        const count = await Note.countDocuments({ userId });
        if (count >= MAX_NOTES_PER_USER) return false;

        await Note.create({ userId, text: noteText });
        return true;
    } catch (error) {
        console.error("Couldn't save debt note:", error);
        return false;
    }
};

module.exports = { isDebtCategory, addDebtNote };
