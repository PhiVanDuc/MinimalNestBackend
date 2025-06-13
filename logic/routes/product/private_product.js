const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer();

const {
    get_products,
    get_product,
    add_product,
    edit_product,
    delete_product,
    add_products_excel
} = require("../../controllers/product/private_product/product.controller");

// Lấy ra danh sách sản phẩm
router.get("/", get_products);

// Lấy ra từng sản phẩm
router.get("/:slug", get_product);

// Thêm sản phẩm
router.post("/", upload.any(), add_product);

// Thêm sản phẩm - excel
router.post("/excel", upload.any(), add_products_excel);

// Chỉnh sửa sản phẩm
router.put("/:slug", upload.any(), edit_product);

// Xóa sản phẩm
router.delete("/:productId", delete_product);

module.exports = router;