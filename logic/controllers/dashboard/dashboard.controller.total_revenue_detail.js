const { Order, OrderItem, ReturnGoods, ReturnGoodsItem, Sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../utils/response");

async function getMonthlyRevenue() {
    const currentYear = new Date().getFullYear();
    
    // Lấy doanh thu từ đơn hàng theo tháng
    const monthlyOrders = await Order.findAll({
        attributes: [
            [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')), 'month'],
            [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "total_order_discount" IS NOT NULL THEN "total_order_discount" ELSE "total_order" END')), 'revenue']
        ],
        where: {
            status: "fulfilled",
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                    currentYear
                )
            ]
        },
        group: ['month'],
        order: ['month'],
        raw: true
    });

    // Lấy số tiền hoàn trả theo tháng
    const monthlyRefunds = await ReturnGoods.findAll({
        attributes: [
            [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')), 'month'],
            [Sequelize.fn('SUM', Sequelize.col('refund_amount')), 'refund']
        ],
        where: {
            status: 'fulfilled',
            is_refunded: true,
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                    currentYear
                )
            ]
        },
        group: ['month'],
        order: ['month'],
        raw: true
    });

    // Tạo bản đồ refund theo tháng
    const refundsByMonth = monthlyRefunds.reduce((acc, item) => {
        acc[item.month] = parseFloat(item.refund) || 0;
        return acc;
    }, {});

    // Tính toán doanh thu theo tháng
    return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const orderData = monthlyOrders.find(item => parseInt(item.month) === month);
        const revenue = orderData ? parseFloat(orderData.revenue) : 0;
        const refund = refundsByMonth[month] || 0;
        
        return {
            month: month,
            revenue: revenue - refund
        };
    });
}

async function getMonthlyCost() {
    const currentYear = new Date().getFullYear();
    
    // Lấy chi phí từ order_items theo tháng
    const monthlyOrderCosts = await OrderItem.findAll({
        attributes: [
            [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "order"."created_at"')), 'month'],
            [Sequelize.fn('SUM', Sequelize.literal('"OrderItem"."cost_price" * "OrderItem"."quantity"')), 'cost']
        ],
        include: [{
            model: Order,
            as: 'order',
            attributes: [],
            where: {
                status: "fulfilled",
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "order"."created_at"')), 
                        currentYear
                    )
                ]
            },
            required: true
        }],
        group: ['month'],
        order: ['month'],
        raw: true
    });

    // Lấy chi phí hoàn trả từ return_goods_items theo tháng
    const monthlyReturnCosts = await ReturnGoodsItem.findAll({
        attributes: [
            [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "return_goods"."created_at"')), 'month'],
            [Sequelize.fn('SUM', Sequelize.literal('"ReturnGoodsItem"."cost_price" * "ReturnGoodsItem"."return_quantity"')), 'return_cost']
        ],
        include: [{
            model: ReturnGoods,
            as: 'return_goods',
            attributes: [],
            where: {
                status: 'fulfilled',
                is_refunded: true,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "return_goods"."created_at"')), 
                        currentYear
                    )
                ]
            },
            required: true
        }],
        group: ['month'],
        order: ['month'],
        raw: true
    });

    // Tạo bản đồ chi phí hoàn trả theo tháng
    const returnCostsByMonth = monthlyReturnCosts.reduce((acc, item) => {
        acc[item.month] = parseFloat(item.return_cost) || 0;
        return acc;
    }, {});

    // Tính toán chi phí ròng theo tháng (chi phí đơn hàng - chi phí hoàn trả)
    return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const orderCostData = monthlyOrderCosts.find(item => parseInt(item.month) === month);
        const cost = orderCostData ? parseFloat(orderCostData.cost) : 0;
        const returnCost = returnCostsByMonth[month] || 0;
        
        return {
            month: month,
            cost: cost - returnCost
        };
    });
}

async function getCurrentYearRevenue() {
    const currentYear = new Date().getFullYear();

    // Lấy tổng doanh thu
    const orderResult = await Order.findOne({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "total_order_discount" IS NOT NULL THEN "total_order_discount" ELSE "total_order" END')), 'revenue']
        ],
        where: {
            status: 'fulfilled',
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')),
                    currentYear
                )
            ]
        },
        raw: true
    });

    const refundResult = await ReturnGoods.findOne({
        attributes: [[Sequelize.fn('SUM', Sequelize.col('refund_amount')), 'refund']],
        where: {
            status: 'fulfilled',
            is_refunded: true,
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')),
                    currentYear
                )
            ]
        },
        raw: true
    });

    const revenue = parseFloat(orderResult.revenue) || 0;
    const refund = parseFloat(refundResult.refund) || 0;

    return revenue - refund;
}

async function getCurrentYearCost() {
    const currentYear = new Date().getFullYear();

    const orderCostResult = await OrderItem.findOne({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('"OrderItem"."cost_price" * "OrderItem"."quantity"')), 'cost']
        ],
        include: [{
            model: Order,
            as: 'order',
            attributes: [],
            where: {
                status: 'fulfilled',
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "order"."created_at"')),
                        currentYear
                    )
                ]
            },
            required: true
        }],
        raw: true
    });

    const returnCostResult = await ReturnGoodsItem.findOne({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('"ReturnGoodsItem"."cost_price" * "ReturnGoodsItem"."return_quantity"')), 'return_cost']
        ],
        include: [{
            model: ReturnGoods,
            as: 'return_goods',
            attributes: [],
            where: {
                status: 'fulfilled',
                is_refunded: true,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "return_goods"."created_at"')),
                        currentYear
                    )
                ]
            },
            required: true
        }],
        raw: true
    });

    const cost = parseFloat(orderCostResult.cost) || 0;
    const returnCost = parseFloat(returnCostResult.return_cost) || 0;

    return cost - returnCost;
}

module.exports = async (req, res) => {
    try {
        const monthlyRevenue = await getMonthlyRevenue();
        const monthlyCost = await getMonthlyCost();

        total_revenue_monthly = monthlyRevenue.map((rev, index) => {
            return {
                month: rev?.month,
                revenue: rev?.revenue,
                cost: monthlyCost[index]?.cost
            }
        });

        const revenueYearly = await getCurrentYearRevenue();
        const costYearly = await getCurrentYearCost();
        
        return response(res, 200, {
            success: true,
            message: "Lấy ra doanh số theo từng tháng thành công!",
            data: {
                total_revenue_monthly,
                total_revenue_yearly: {
                    year: new Date().getFullYear(),
                    revenue: revenueYearly,
                    cost: costYearly
                }
            } 
        });
    }
    catch(error) {
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}