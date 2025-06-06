const express = require("express");
const router = express.Router();

const {
    get_product_types
} = require("../controllers/product_type.controller");

// Lấy ra danh sách loại sản phẩm
router.get("/", get_product_types);

module.exports = router;