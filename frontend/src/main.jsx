import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";

import "./theme.css";
import "./index.css";
import { initTheme } from "./theme.js";

initTheme();

// Error monitoring: only loaded when VITE_SENTRY_DSN is set, so it adds nothing otherwise
if (import.meta.env.VITE_SENTRY_DSN) {
    import("@sentry/react").then((Sentry) => {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,
            // No IP addresses or other personal data
            sendDefaultPii: false
        });
    });
}

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <AuthProvider>
            <App />
        </AuthProvider>

    </StrictMode>
);