const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://money-tracker-johan-183b.vercel.app", // preview
    "https://money-tracker-eight-orcin.vercel.app"            // production (no trailing slash!)
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
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

app.use(express.json());

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

const PORT = process.env.PORT || 5000;

// Only accept traffic once the database is ready
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
