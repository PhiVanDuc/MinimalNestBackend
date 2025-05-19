const express = require("express");
const router = express.Router();

const {
    get_permissions
} = require("../controllers/permission.controller");

router.get("/", get_permissions);

module.exports = router;