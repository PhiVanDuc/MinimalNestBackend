const express = require("express");
const router = express.Router();

const {
    get_cart,
    add_cart,
    delete_cart_item
} = require("../controllers/cart.controller");

router.get("/:accountId", get_cart);
router.post("/", add_cart);
router.delete("/:cartItemId", delete_cart_item);

module.exports = router;