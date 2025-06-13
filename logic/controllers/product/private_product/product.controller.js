const get_products = require("./product.controller.gets");
const get_product = require("./product.controller.get");
const add_product = require("./product.controller.add");
const edit_product = require("./product.controller.edit");
const delete_product = require("./product.controller.delete");
const add_products_excel = require("./product.controller.add_excel");

module.exports = {
    get_products,
    get_product,
    add_product,
    edit_product,
    delete_product,
    add_products_excel
}