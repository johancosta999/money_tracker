import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

// Header gear menu: account settings, dark mode toggle and logout.
function SettingsMenu({ onLogout }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on Escape or a click outside the menu
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
                className="dashboard-action settings-menu-button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Settings menu"
                aria-expanded={open}
                aria-haspopup="true"
            >
                ⚙
            </button>

            {open && (
                <div className="notification-panel settings-menu-panel" aria-label="Settings menu">
                    <Link to="/settings" className="settings-menu-item">
                        ⚙ Settings
                    </Link>

                    {/* Menu stays open so the theme change can be seen */}
                    <ThemeToggle className="settings-menu-item" />

                    <button
                        type="button"
                        className="settings-menu-item settings-menu-logout"
                        onClick={onLogout}
                    >
                        ⎋ Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default SettingsMenu;
