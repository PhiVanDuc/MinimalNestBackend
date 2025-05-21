const express = require("express");
const router = express.Router();

const {
    get_categories
} = require("../controllers/category.controller");

// Lấy ra danh sách danh mục
router.get("/", get_categories);

module.exports = router;