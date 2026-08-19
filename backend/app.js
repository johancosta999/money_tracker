const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./route/userRoute"));
app.use("/api/auth", require("./route/authRoute"))
app.use("/api/transactions", require("./route/transactionsRoute"));
app.use("/api/categories", require("./route/categoryRoutes"))

app.get("/", (req, res) => {
    res.json({
        message: "Money Tracker API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});