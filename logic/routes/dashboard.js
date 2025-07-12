const express = require("express");
const router = express.Router();

const {
    total_products,
    total_orders,
    total_revenue,
    total_revenue_detail,
    order_status_quantities,
    vip_customers,
    best_seller_products
} = require("../controllers/dashboard/dashboard.controller");

router.get("/total_products", total_products);
router.get("/total_orders", total_orders);
router.get("/total_revenue", total_revenue);
router.get("/total_revenue_detail", total_revenue_detail);
router.get("/order_status_quantities", order_status_quantities);
router.get("/vip_customers", vip_customers);
router.get("/best_seller_products", best_seller_products);

module.exports = router;