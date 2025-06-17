const express = require("express");
const router = express.Router();

const {
    get_accounts,
    get_account,
    edit_account,
    profile_change_info,
    profile_change_password
} = require("../controllers/account.controller");

// Lấy ra danh sách role
router.get("/", get_accounts);

// Lấy ra từng account
router.get("/:accountId", get_account);

// Chỉnh sửa vai trò
router.put("/:accountId", edit_account);

// Chỉnh sửa thông tin trong profile
router.patch("/profile/info/:accountId", profile_change_info);

// Chỉnh sửa mật khẩu trong profile
router.patch("/profile/password/:accountId", profile_change_password);

module.exports = router;