const express = require("express");
const router = express.Router();

const {
    create_otp,
    register,
    sign_in,
    reset_password
} = require("../controllers/auth.controller");

router.post("/create_otp", create_otp);
router.post("/register", register);
router.post("/sign_in", sign_in);
router.post("/reset_password", reset_password);

module.exports = router;