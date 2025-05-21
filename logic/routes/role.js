const express = require("express");
const router = express.Router();

const {
    get_roles,
    get_role,
    add_role,
    edit_role,
    delete_role
} = require("../controllers/role.controller");

// Lấy ra danh sách vai trò
router.get("/", get_roles);

// Lấy ra từng vai trò
router.get("/:slug", get_role);

// Thêm vai trò
router.post("/", add_role);

// Chỉnh sửa vai trò
router.put("/:slug", edit_role);

// Xóa vai trò
router.delete("/:slug", delete_role);

module.exports = router;