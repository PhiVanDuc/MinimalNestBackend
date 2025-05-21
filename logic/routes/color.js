const express = require("express");
const router = express.Router();

const {
    get_colors,
    get_color,
    add_color,
    edit_color,
    delete_color
} = require("../controllers/color.controller");

// Lấy ra danh sách màu sắc
router.get("/", get_colors);

// Lấy ra từng màu sắc
router.get("/:colorId", get_color);

// Thêm màu sắc
router.post("/", add_color);

// Chỉnh sửa màu sắc
router.put("/:colorId", edit_color);

// Xóa màu sắc
router.delete("/:colorId", delete_color);

module.exports = router;