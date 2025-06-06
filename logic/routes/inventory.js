const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
    analysis_inventory,
    get_inventories,
    edit_inventory,
    add_inventories_excel
} = require("../controllers/inventory.controller");

// Phân tích số lượng sản phẩm
router.get("/analysis", analysis_inventory);

// Lấy ra danh sách số lượng sản phẩm
router.get("/", get_inventories);

// Thêm số lượng sản phẩm
router.post("/excel", upload.any(), add_inventories_excel);

// Chỉnh sửa số lượng sản phẩm
router.put("/:inventoryId", edit_inventory);

// Xóa số lượng sản phẩm
// router.delete("/:slug", delete_role);

module.exports = router;