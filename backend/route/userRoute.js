const express = require("express");

const router = express.Router();

const { createUser, getUsers, getUser, updateUser, deleteUser } = require("../controller/userController");

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;