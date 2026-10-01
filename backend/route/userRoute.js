const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const { updateUser, deleteUser } = require("../controller/userController");

// The old "list all users" and "get user by id" routes were removed: they let any
// logged-in user see every account's email, age and password hash.
// Use GET /api/auth/me to get the logged-in user instead.
// Both routes below only work on the caller's own account (checked in the controller).
router.use(protect);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
