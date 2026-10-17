const express = require("express")

const router = express.Router();

const protect = require("../middleware/authMiddleware")

const { getNotes, createNote, deleteNote } = require("../controller/noteController")

router.get("/", protect, getNotes);
router.post("/", protect, createNote);
router.delete("/:id", protect, deleteNote);

module.exports = router;
