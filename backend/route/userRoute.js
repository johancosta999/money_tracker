const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const {  getUsers, getUser, updateUser, deleteUser } = require("../controller/userController");

router.use(protect);
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;