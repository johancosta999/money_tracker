import { useEffect } from "react";

// Pop-up card showing every detail of one transaction (normal or bank).
// rows: [{ label, value }] - rows with an empty value are skipped.
function TransactionDetailsModal({ eyebrow, title, amount, amountClass, rows, onClose }) {

    // Close with the Escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="details-overlay" role="presentation" onClick={onClose}>
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
            </div>
        </div>
    );
}

export default TransactionDetailsModal;
