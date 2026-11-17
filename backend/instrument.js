// Error monitoring with Sentry. Loaded first in app.js so Sentry can hook into
// Express and the database driver. It only turns on when SENTRY_DSN is set,
// so the app runs exactly the same before you create a Sentry project.
require("dotenv").config();

const Sentry = require("@sentry/node");

const sentryEnabled = Boolean(process.env.SENTRY_DSN);

if (sentryEnabled) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        // Don't attach IP addresses, cookies or request bodies (they can hold passwords / money data)
        sendDefaultPii: false,
        // Errors only; no performance tracing (keeps the free tier quota for errors)
        tracesSampleRate: 0,
        // Every controller already logs unexpected errors with console.error,
        // so sending console.error calls to Sentry covers the whole API
        integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })]
    });
}
