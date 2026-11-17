import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";

import "./theme.css";
import "./index.css";
import { initTheme } from "./theme.js";

initTheme();

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <AuthProvider>
            <App />
        </AuthProvider>

    </StrictMode>
);