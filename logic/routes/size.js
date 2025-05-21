const express = require("express");
const router = express.Router();

const {
    get_sizes,
    get_size,
    add_size,
    edit_size,
    delete_size
} = require("../controllers/size.controller");

// Lấy ra danh sách kích cỡ
router.get("/", get_sizes);

// Lấy ra từng kích cỡ
router.get("/:sizeId", get_size);

// Thêm kích cỡ
router.post("/", add_size);

// Chỉnh sửa kích cỡ
router.put("/:sizeId", edit_size);

// Xóa kích cỡ
router.delete("/:sizeId", delete_size);

module.exports = router;