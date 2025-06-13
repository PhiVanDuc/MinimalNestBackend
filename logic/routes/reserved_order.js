const express = require("express");
const router = express.Router();

const {
    get_reserved_order,
    create_reserved_order
} = require("../controllers/reserved_order/reserved_order.controller");

router.get("/:reservedOrderId", get_reserved_order);
router.post("/", create_reserved_order);

module.exports = router;