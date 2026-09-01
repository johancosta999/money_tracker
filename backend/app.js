const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

connectDB();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://money-tracker-43a9crzxi-johan-183b.vercel.app"
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// app.use("/api/users", require("./route/userRoute"));
app.use("/api/auth", require("./route/authRoute"))
app.use("/api/transactions", require("./route/transactionsRoute"));
app.use("/api/categories", require("./route/categoryRoutes"))
app.use("/api/budget", require("./route/budgetRouter"))
app.use("/api/plan", require("./route/plannerRoutes"))
app.use("/api/dashboard", require("./route/dashboardRoute"))

app.get("/", (req, res) => {
    res.json({
        message: "Money Tracker API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});