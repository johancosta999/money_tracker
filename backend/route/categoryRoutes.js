const express = require("express")

const router = express.Router();

const protect = require("../middleware/authMiddleware")

const { createCategory, getCategories, getCategory, updateCategory, deleteCategory } = require("../controller/categoryController")

router.post("/", protect, createCategory);
router.get("/", protect, getCategories);
router.get("/:id", protect, getCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;