const get_return_goods = require("./return_goods.gets.controller");
const gets_admin_return_goods = require("./return_goods.admin.gets.controller");
const get_admin_return_goods = require("./return_goods.admin.get.controller");
const add_return_goods = require("./return_goods.add.controller");
const update_admin_return_goods = require("./return_goods.admin.update.controller");
const refund_admin_return_goods = require("./return_goods.admin.refund.controller");

module.exports = {
    get_return_goods,
    gets_admin_return_goods,
    get_admin_return_goods,
    add_return_goods,
    update_admin_return_goods,
    refund_admin_return_goods
}