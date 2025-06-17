const express = require("express");
const router = express.Router();

const {
    get_admin_orders,
    get_orders,
    create_order,
    update_status_orders
} = require("../controllers/order/order.controller");

router.get("/admin", get_admin_orders);
router.get("/:accountId", get_orders);
router.post("/", create_order);
router.patch("/admin", update_status_orders);

module.exports = router;