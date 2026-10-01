const express = require("express");
const cors = require("cors");
const helmet = require("helmet");                   // sets standard security headers
const rateLimit = require("express-rate-limit");    // limits requests per IP
const connectDB = require("./config/db");

require("dotenv").config();

// Refuse to start with missing or weak secrets.
// Without JWT_SECRET, tokens can't be signed safely; without MONGO_URI there is no database.
// A short JWT_SECRET only warns, so the app still starts while you rotate it.
const missingEnv = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missingEnv.length) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
    console.warn("JWT_SECRET is shorter than 32 characters; use a long random value in production");
}

const app = express();

// Hosting platforms sit behind a proxy; needed for correct client IPs in rate limiting.
// Without this, every user would look like the proxy's IP and share one rate limit.
app.set("trust proxy", 1);

const allowedOrigins = [
    "http://localhost:5173",
    "https://money-tracker-johan-183b.vercel.app", // preview
    "https://money-tracker-eight-orcin.vercel.app"            // production (no trailing slash!)
];

// Only this project's own Vercel preview deployments, not every *.vercel.app site.
// Previously any site hosted on Vercel (including someone else's) could call this API.
// Matches e.g. money-tracker-git-main-johan-183b.vercel.app and money-tracker-abc123-johan-183b.vercel.app
const previewOriginPattern = /^https:\/\/money-tracker-([a-z0-9-]+-)?johan-183b\.vercel\.app$/;

// Adds security headers (e.g. stops browsers guessing content types, hides "X-Powered-By: Express")
app.use(helmet());

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin) || previewOriginPattern.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// Reject huge request bodies so nobody can slow the server down by sending megabytes of JSON
app.use(express.json({ limit: "100kb" }));

// General limit for the whole API: 300 requests per 15 minutes per IP.
// Plenty for normal use, but stops scripts from hammering the server.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" }
});

// Slows down password guessing and mass sign-ups: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again in 15 minutes" }
});

// Limiters must be registered before the routes they protect
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth", require("./route/authRoute"));
app.use("/api/users", require("./route/userRoute"));
app.use("/api/transactions", require("./route/transactionsRoute"));
app.use("/api/categories", require("./route/categoryRoutes"));
app.use("/api/budget", require("./route/budgetRouter"));
app.use("/api/plan", require("./route/plannerRoutes"));
app.use("/api/dashboard", require("./route/dashboardRoute"));
app.use("/api/bank", require('./route/bankTransactionsRoutes'))

app.get("/", (req, res) => {
    res.json({
        message: "Money Tracker API is running"
    });
});

// Lightweight endpoint for uptime pings / platform health checks
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Any URL that didn't match a route above gets a JSON 404 instead of Express's HTML page
app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

// Central error handler: controllers call next(error) and end up here.
// Log the real error server-side, but never send internals to the client.
// Express recognises error handlers by their 4 arguments, so `next` must stay.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // Body wasn't valid JSON (e.g. a typo in a curl request)
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON body" });
    }
    // Body was bigger than the 100kb limit set above
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Request body is too large" });
    }
    // Request came from a website that isn't in the CORS allow list
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ message: "Origin not allowed" });
    }

    // Anything else is a real bug: log details for us, generic message for the user
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
});

const PORT = process.env.PORT || 5000;

// Only accept traffic once the database is ready
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
