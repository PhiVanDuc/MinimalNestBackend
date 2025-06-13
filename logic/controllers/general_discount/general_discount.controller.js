const get_general_discounts = require("./general_discount.controller.gets");
const add_general_discounts = require("./general_discount.controller.add");
const edit_general_discounts = require("./general_discount.controller.edit");
const delete_general_discounts = require("./general_discount.controller.delete");
const get_filter_products = require("./general_discount.controller.filter_products");

module.exports = {
    get_general_discounts,
    add_general_discounts,
    edit_general_discounts,
    delete_general_discounts,
    get_filter_products
}