const express = require("express");
const router = express.Router();

const {
    create_payment_intent
} = require("../controllers/payment/payment.controller");

router.post("/payment_intent", create_payment_intent);

module.exports = router;