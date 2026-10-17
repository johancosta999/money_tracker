import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import { formatDateTime } from "../utils/transactionDetails";

import "./dashboard.css";
import "./Notes.css";

// Must match NOTE_MAX_LENGTH in the backend note model
const NOTE_MAX_LENGTH = 500;

function Notes() {
  const [notes, setNotes] = useState([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // Id of the note currently being deleted, so only its button is disabled
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get("/notes");

        setNotes(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(getErrorMessage(error, "Couldn't load notes"));
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError("");

    try {
      const { data } = await api.post("/notes", { text: trimmed });

      setNotes((current) => [data, ...current]);
      setText("");
    } catch (error) {
      setError(getErrorMessage(error, "Couldn't save the note"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note? Its notification will be cleared.")) return;

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/notes/${id}`);

      setNotes((current) => current.filter((note) => note._id !== id));
    } catch (error) {
      setError(getErrorMessage(error, "Couldn't delete the note"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-greeting">NOTES</p>

          <h1>Your Notes</h1>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/dashboard" className="dashboard-action">
            ← Dashboard
          </Link>
        </div>
      </header>

      <p className="notes-hint" role="note">
        🔔 Each note shows a notification on your dashboard. To clear a
        notification, delete its note.
      </p>

      <form className="note-form" onSubmit={handleSubmit}>
        <label htmlFor="noteText" className="note-form-label">
          New note
        </label>

        <textarea
          id="noteText"
          className="note-input"
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="e.g. Rs. 5,000 transfer to Kamal is a loan, collect it back next month"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <div className="note-form-footer">
          <span className="note-counter">
            {text.length}/{NOTE_MAX_LENGTH}
          </span>

          <button
            type="submit"
            className="note-submit"
            disabled={!text.trim() || saving}
          >
            {saving ? "Saving..." : "+ Add Note"}
          </button>
        </div>
      </form>

      {error && (
        <div className="notes-error" role="alert">
          {error}
        </div>
      )}

      <section className="dashboard-section">
        <div className="section-heading">
          <p>SPECIAL NOTES</p>

          <h2>
            Saved Notes{notes.length > 0 ? ` (${notes.length})` : ""}
          </h2>
        </div>

        {loading ? (
          <div className="filter-empty">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="filter-empty">
            No notes yet. Add one above to remember something about a transaction.
          </div>
        ) : (
          <ul className="notes-list">
            {notes.map((note) => (
              <li className="note-card" key={note._id}>
                <div className="note-body">
                  <p className="note-text">{note.text}</p>

                  <span className="note-date">{formatDateTime(note.createdAt)}</span>
                </div>

                <button
                  type="button"
                  className="note-delete"
                  onClick={() => handleDelete(note._id)}
                  disabled={deletingId === note._id}
                  aria-label="Delete note"
                >
                  {deletingId === note._id ? "..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Notes;
