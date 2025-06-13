const express = require("express");
const router = express.Router();

const {
    get_book_addresses,
    add_book_address,
    edit_book_address,
    delete_book_address
} = require("../controllers/book_address.controller");

router.get("/:accountId", get_book_addresses);
router.post("/:accountId", add_book_address);
router.put("/:accountId", edit_book_address);
router.delete("/:addressId", delete_book_address);

module.exports = router;