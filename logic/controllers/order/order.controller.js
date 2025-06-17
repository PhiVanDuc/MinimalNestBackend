const get_orders = require("./order.gets.controller");
const create_order = require("./order.create.controller");
const get_admin_orders = require("./order.admin.gets.controller");
const update_status_orders = require("./order.status.controller");

module.exports = {
    get_admin_orders,
    get_orders,
    create_order,
    update_status_orders
}