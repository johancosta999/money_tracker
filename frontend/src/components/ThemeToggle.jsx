import { toggleTheme, useTheme } from "../theme";

// Switches between light and dark mode. Pass the page's button class so it
// matches the surrounding buttons.
function ThemeToggle({ className = "", showLabel = true }) {
    const theme = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            className={className}
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? "☀" : "☾"}{showLabel && (isDark ? " Light mode" : " Dark mode")}
        </button>
    );
}

export default ThemeToggle;
