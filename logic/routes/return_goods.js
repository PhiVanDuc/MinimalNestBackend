const express = require("express");
const router = express.Router();

const multer = require('multer');
const upload = multer();

const {
    get_return_goods,
    gets_admin_return_goods,
    get_admin_return_goods,
    add_return_goods,
    update_admin_return_goods,
    refund_admin_return_goods
} = require("../controllers/return_goods/return_goods.controller");

router.get("/admin", gets_admin_return_goods);
router.get("/admin/:returnGoodsId", get_admin_return_goods);
router.patch("/admin/:returnGoodsId", update_admin_return_goods);
router.patch("/admin/refund/:returnGoodsId", refund_admin_return_goods);

router.get("/:accountId", get_return_goods);
router.post("/", upload.any(), add_return_goods);

module.exports = router;