const express = require("express");
const router = express.Router();

const {
    get_general_discounts,
    add_general_discounts,
    edit_general_discounts,
    delete_general_discounts,
    get_filter_products
} = require("../controllers/general_discount.controller.js/general_discount.controller");

// Lấy ra danh sách giảm giá chung
router.get("/", get_general_discounts);

// Thêm giảm giá chung
router.post("/", add_general_discounts);

// Chỉnh sửa giảm giá chung
router.put("/:generalDiscountId", edit_general_discounts);

// Xóa giảm giá chung
router.delete("/:generalDiscountId", delete_general_discounts);

// Lấy ra danh sách sản phẩm được lọc
router.post("/filter_products", get_filter_products);

module.exports = router;