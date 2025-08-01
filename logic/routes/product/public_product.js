const express = require("express");
const router = express.Router();

const {
    get_public_products,
    get_all_public_products,
    get_public_product
} = require("../../controllers/product/public_product/public_product.controller");

// Lấy ra danh sách sản phẩm
router.get("/", get_public_products);

// Lấy danh sách sản phẩm (không lọc và phân trang)
router.get("/all", get_all_public_products);

// Lấy ra sản phẩm cụ thể
router.get("/:slug", get_public_product);

module.exports = router;