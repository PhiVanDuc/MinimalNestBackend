const express = require("express");
const router = express.Router();

const {
    get_colors
} = require("../../controllers/color/public_color.controller");

// Lấy ra danh sách màu sắc
router.get("/", get_colors);

// Lấy ra từng màu sắc
router.get("/", get_colors);

module.exports = router;