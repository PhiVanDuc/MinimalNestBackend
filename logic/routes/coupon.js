const express = require("express");
const router = express.Router();

const {
    get_coupons,
    get_coupon,
    add_coupon,
    edit_coupon,
    delete_coupon
} = require("../controllers/coupon.controller");

// Lấy ra danh sách phiếu giảm giá
router.get("/", get_coupons);

// Lấy ra từng phiếu giảm giá
router.get("/:couponId", get_coupon);

// Thêm phiếu giảm giá
router.post("/", add_coupon);

// Chỉnh sửa phiếu giảm giá
router.put("/:couponId", edit_coupon);

// Xóa phiếu giảm giá
router.delete("/:couponId", delete_coupon);

module.exports = router;