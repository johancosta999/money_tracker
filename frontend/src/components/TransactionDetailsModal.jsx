import { useEffect, useState } from "react";
import { getErrorMessage } from "../services/api";

// Pop-up card showing every detail of one transaction (normal or bank).
// rows: [{ label, value }] - rows with an empty value are skipped.
// onEdit / onDelete are optional; when given, Edit and Delete buttons are shown.
// onDelete may return a promise: the modal waits for it and shows any error.
function TransactionDetailsModal({ eyebrow, title, amount, amountClass, rows, onClose, onEdit, onDelete }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    // Close with the Escape key (not while a delete is in progress)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !deleting) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, deleting]);

    const handleDelete = async () => {
        setError("");
        setDeleting(true);

        try {
            await onDelete();
        } catch (deleteError) {
            setError(getErrorMessage(deleteError, "Couldn't delete this transaction"));
            setDeleting(false);
        }
    };

    return (
        <div className="details-overlay" role="presentation" onClick={deleting ? undefined : onClose}>
            <div
                className="details-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="details-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="details-close"
                    onClick={onClose}
                    aria-label="Close details"
                    disabled={deleting}
                    autoFocus
                >
                    ×
                </button>

                <p className="details-eyebrow">{eyebrow}</p>
                <h2 id="details-title">{title}</h2>

                <strong className={`details-amount ${amountClass || ""}`}>
                    {amount}
                </strong>

                <dl className="details-list">
                    {rows
                        .filter((row) => row.value !== undefined && row.value !== null && row.value !== "")
                        .map((row) => (
                            <div className="details-row" key={row.label}>
                                <dt>{row.label}</dt>
                                <dd>{row.value}</dd>
                            </div>
                        ))}
                </dl>

                {error && <p className="details-error" role="alert">{error}</p>}

                {(onEdit || onDelete) && (
                    confirmingDelete ? (
                        <div className="details-actions">
                            <p className="details-confirm-text">Delete this transaction? This can't be undone.</p>
                            <button
                                type="button"
                                className="details-button"
                                onClick={() => setConfirmingDelete(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="details-button details-button-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    ) : (
                        <div className="details-actions">
                            {onEdit && (
                                <button type="button" className="details-button details-button-primary" onClick={onEdit}>
                                    ✎ Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type="button"
                                    className="details-button details-button-danger"
                                    onClick={() => setConfirmingDelete(true)}
                                >
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default TransactionDetailsModal;
