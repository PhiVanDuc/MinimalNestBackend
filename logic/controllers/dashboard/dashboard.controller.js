const total_products = require("./dashboard.controller.total_products");
const total_orders = require("./dashboard.controller.total_orders");
const total_revenue = require("./dashboard.controller.total_revenue");
const total_revenue_detail = require("./dashboard.controller.total_revenue_detail");
const order_status_quantities = require("./dashboard.controller.order_status_quantities");
const vip_customers = require("./dashboard.controller.vip_customers");
const best_seller_products = require("./dashboard.controller.best_seller_products");

module.exports = {
    total_products,
    total_orders,
    total_revenue,
    total_revenue_detail,
    order_status_quantities,
    vip_customers,
    best_seller_products
}