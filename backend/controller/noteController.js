const mongoose = require('mongoose')
const Note = require('../model/noteModel')
const { NOTE_MAX_LENGTH } = require('../model/noteModel')

// Note: 500 responses only send a generic message. The real error is logged
// with console.error on the server, so database details never reach the browser.

// Cap per user so one account can't fill the database with notes
const MAX_NOTES_PER_USER = 100;

// GET /api/notes
// Newest first. The dashboard uses the count for the notification dot.
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(MAX_NOTES_PER_USER);

        res.status(200).json(notes)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Couldn't load notes",
        })
    }
};

// POST /api/notes   body: { text }
const createNote = async (req, res) => {
    try {
        const { text } = req.body;

        // typeof check rejects objects/arrays sent instead of text
        if (typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: "Note can't be empty" });
        }

        if (text.trim().length > NOTE_MAX_LENGTH) {
            return res.status(400).json({
                message: `Note must be ${NOTE_MAX_LENGTH} characters or less`
            });
        }

        const count = await Note.countDocuments({ userId: req.userId });
        if (count >= MAX_NOTES_PER_USER) {
            return res.status(400).json({
                message: `You can keep up to ${MAX_NOTES_PER_USER} notes. Delete some to add more`
            });
        }

        const note = await Note.create({
            text,
            userId: req.userId
        });

        res.status(201).json(note)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Couldn't save the note",
        })
    }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        // A malformed id would otherwise throw a CastError and look like a server error
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ message: "Note not found" });
        }

        const note = await Note.findOneAndDelete({
            _id: id,
            userId: req.userId
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({
            message: "Note deleted",
            deletedNote: note
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Couldn't delete the note",
        })
    }
};

module.exports = {
    getNotes,
    createNote,
    deleteNote
};
