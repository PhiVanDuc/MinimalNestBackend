const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
    get_events,
    get_event,
    add_event,
    edit_event,
    delete_event
} = require("../../controllers/event/private_event/event.controller");

// Lấy ra danh sách role
router.get("/", get_events);

// Lấy ra từng role
router.get("/:slug", get_event);

// Thêm role
router.post("/", upload.single("image"), add_event);

// Chỉnh sửa vai trò
router.put("/:slug", upload.single("image"), edit_event);

// Xóa role
router.delete("/:slug", delete_event);

module.exports = router;