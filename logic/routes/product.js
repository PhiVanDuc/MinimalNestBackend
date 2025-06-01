const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer();

const {
    get_product,
    add_product,
    edit_product
} = require("../controllers/product.controller/product.controller");

// Lấy ra danh sách sản phẩm
// router.get("/", get_roles);

// Lấy ra từng sản phẩm
router.get("/:slug", get_product);

// Thêm sản phẩm
router.post("/", upload.any(), add_product);

// Chỉnh sửa sản phẩm
router.put("/:slug", upload.any(), edit_product);

// Xóa sản phẩm
// router.delete("/:slug", delete_role);

module.exports = router;