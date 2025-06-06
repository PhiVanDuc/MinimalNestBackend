const express = require("express");
const router = express.Router();

const {
    get_public_products,
    get_all_public_products,
    get_public_product
} = require("../controllers/public_product.controller");

// Lấy ra danh sách vai trò
router.get("/", get_public_products);

// Lấy danh sách vai trò (không lọc và phân trang)
router.get("/all", get_all_public_products);

// Lấy ra sản phẩm cụ thể
router.get("/:slug", get_public_product);

module.exports = router;