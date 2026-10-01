const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const { updateUser, deleteUser } = require("../controller/userController");

router.use(protect);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
