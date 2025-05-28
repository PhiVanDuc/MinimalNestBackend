const express = require("express");
const router = express.Router();

const {
    get_living_spaces
} = require("../controllers/living_space.controller");

// Lấy ra danh sách danh mục
router.get("/", get_living_spaces);

module.exports = router;