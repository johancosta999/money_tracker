const express = require("express");

const router = express.Router();

const { register, login, getMe } = require("../controller/authController")
const protect = require("../middleware/authMiddleware")
const { forgotPassword, resetPassword } = require("../controller/passwordResetController")

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;