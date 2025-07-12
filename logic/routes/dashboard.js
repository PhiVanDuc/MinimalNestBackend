const express = require("express");
const router = express.Router();

const {
    total_products,
    total_orders,
    total_revenue,
    total_revenue_detail,
    status_order,
    vip_customers
} = require("../controllers/dashboard.controller");

router.get("/total_products", total_products);
router.get("/total_orders", total_orders);
router.get("/total_revenue", total_revenue);
router.get("/total_revenue_detail", total_revenue_detail);
router.get("/status_order", status_order);
router.get("/vip_customers", vip_customers);

module.exports = router;