import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Header bell. Every saved note counts as a notification:
// the green dot stays until the user deletes their notes.
function NotificationBell({ notes }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const count = notes.length;

    // Close on Escape or a click outside the panel
    useEffect(() => {
        if (!open) return;

        const handleClick = (event) => {
            if (!wrapperRef.current?.contains(event.target)) setOpen(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleClick);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div className="notification-wrapper" ref={wrapperRef}>
            <button
                type="button"
                className="dashboard-action notification-bell"
                onClick={() => setOpen((current) => !current)}
                aria-label={count ? `Notifications: ${count} note${count === 1 ? "" : "s"}` : "Notifications"}
                aria-expanded={open}
                aria-haspopup="true"
            >
                🔔
                {count > 0 && <span className="notification-dot" aria-hidden="true" />}
            </button>

            {open && (
                <div className="notification-panel" role="dialog" aria-label="Notifications">
                    <p className="notification-title">Notifications</p>

                    {count === 0 ? (
                        <p className="notification-empty">You're all caught up.</p>
                    ) : (
                        <>
                            <ul className="notification-list">
                                {notes.slice(0, 3).map((note) => (
                                    <li key={note._id}>{note.text}</li>
                                ))}
                            </ul>

                            {count > 3 && (
                                <p className="notification-more">+{count - 3} more</p>
                            )}

                            <p className="notification-hint">
                                To clear notifications, delete the notes.
                            </p>
                        </>
                    )}

                    <Link to="/notes" className="notification-link">
                        {count ? "Manage notes →" : "Add a note →"}
                    </Link>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
