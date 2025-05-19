const express = require("express");
const router = express.Router();

const {
    get_accounts,
    get_account,
    edit_account
} = require("../controllers/account.controller");

// Lấy ra danh sách role
router.get("/", get_accounts);

// Lấy ra từng account
router.get("/:accountId", get_account);

// Chỉnh sửa vai trò
router.put("/:accountId", edit_account);

module.exports = router;