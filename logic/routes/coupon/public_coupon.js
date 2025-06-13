const express = require("express");
const router = express.Router();

const {
    get_public_coupons
} = require("../../controllers/coupon/public_coupon/public_coupon.controller");

// Lấy ra danh sách phiếu giảm giá
router.get("/", get_public_coupons);

module.exports = router;