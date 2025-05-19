const express = require("express");
const router = express.Router();

const {
    verify_token,
    refresh_access_token
} = require("../controllers/token.controller");

router.post("/verify_token", verify_token);
router.post("/refresh_access_token", refresh_access_token);

module.exports = router;