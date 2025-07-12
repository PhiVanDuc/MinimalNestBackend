const { Account, Product, Order, OrderItem, ReturnGoods, ReturnGoodsItem, Sequelize, sequelize } = require("../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../utils/response");

module.exports = {
    total_products: async (req, res) => {
        try {
            const totalProducts = await Product.count();
            return response(res, 200, {
                success: true,
                message: "Lấy ra tổng số sản phẩm đang có thành công!",
                data: {
                    total_products: totalProducts
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
    },

    total_orders: async (req, res) => {
        try {
            const currentYear = new Date().getFullYear();
            const totalOrders = await Order.count({
                where: Sequelize.where(
                    Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                    currentYear
                )
            });

            return response(res, 200, {
                success: true,
                message: "Lấy ra tổng số đơn hàng thành công!",
                data: {
                    total_orders: totalOrders
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
    },

    total_revenue: async (req, res) => {
        try {
            const currentYear = new Date().getFullYear();

            const totalRevenue = await Order.sum('total_order', {
                where: {
                    status: "fulfilled",
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                            currentYear
                        )
                    ]
                }
            }) || 0;

            const totalRefund = await ReturnGoods.sum('refund_amount', {
                where: {
                    status: 'fulfilled',
                    is_refunded: true,
                    [Op.and]: [
                        Sequelize.where(
                            Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                            currentYear
                        )
                    ]
                }
            }) || 0;

            const netRevenue = totalRevenue - totalRefund;
            return response(res, 200, {
                success: true,
                message: "Lấy ra tổng doanh số thành công!",
                data: {
                    total_revenue: netRevenue
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
    },

    total_revenue_detail: async (req, res) => {
        try {
            const currentYear = new Date().getFullYear();

            async function calculateProfit() {
                const completedOrders = await Order.sum('total_order', {
                    where: {
                        status: 'fulfilled',
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                                currentYear
                            )
                        ]
                    }
                });

                const completedReturns = await ReturnGoods.sum('refund_amount', {
                    where: {
                        status: 'fulfilled',
                        is_refunded: true,
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), 
                                currentYear
                            )
                        ]
                    }
                });

                return (completedOrders || 0) - (completedReturns || 0);
            }

            async function calculateCost() {
                const orderItems = await OrderItem.findAll({
                    attributes: [
                        [sequelize.literal('SUM(cost_price * quantity)'), 'total_cost']
                    ],
                    include: [{
                        model: Order,
                        as: 'order',
                        where: {
                            status: 'fulfilled',
                        },
                        attributes: []
                    }],
                    raw: true
                });

                const returnItems = await ReturnGoodsItem.findAll({
                    attributes: [
                        [sequelize.literal('SUM(cost_price * return_quantity)'), 'total_cost']
                    ],
                    include: [{
                        model: ReturnGoods,
                        as: 'return_goods',
                        where: { 
                            status: 'fulfilled',
                            is_refunded: true 
                        },
                        attributes: []
                    }],
                    raw: true
                });

                const orderCost = parseFloat(orderItems[0]?.total_cost || 0);
                const returnCost = parseFloat(returnItems[0]?.total_cost || 0);

                return orderCost - returnCost;
            }

            async function calculateMonthlyProfit(month) {
                const startDate = new Date(currentYear, month - 1, 1);
                const endDate = new Date(currentYear, month, 0);

                const completedOrders = await Order.sum('total_order', {
                    where: {
                        status: 'fulfilled',
                        created_at: { [Sequelize.Op.between]: [startDate, endDate] }
                    }
                });

                const completedReturns = await ReturnGoods.sum('refund_amount', {
                    where: {
                        status: 'fulfilled',
                        is_refunded: true,
                        created_at: { [Sequelize.Op.between]: [startDate, endDate] }
                    }
                });

                return (completedOrders || 0) - (completedReturns || 0);
            }

            async function calculateMonthlyCost(month) {
                const startDate = new Date(currentYear, month - 1, 1);
                const endDate = new Date(currentYear, month, 0);

                const orderItems = await OrderItem.findAll({
                    attributes: [[sequelize.literal('SUM(cost_price * quantity)'), 'total_cost']],
                    include: [{
                        model: Order,
                        as: 'order',
                        where: { 
                            status: 'fulfilled',
                            created_at: { [Sequelize.Op.between]: [startDate, endDate] }
                        },
                        attributes: []
                    }],
                    raw: true
                });

                const returnItems = await ReturnGoodsItem.findAll({
                    attributes: [[sequelize.literal('SUM(cost_price * return_quantity)'), 'total_cost']],
                    include: [{
                        model: ReturnGoods,
                        as: 'return_goods',
                        where: { 
                            status: 'fulfilled',
                            is_refunded: true,
                            created_at: { [Sequelize.Op.between]: [startDate, endDate] }
                        },
                        attributes: []
                    }],
                    raw: true
                });

                const orderCost = parseFloat(orderItems[0]?.total_cost || 0);
                const returnCost = parseFloat(returnItems[0]?.total_cost || 0);

                return orderCost - returnCost;
            }

            async function getMonthlyData() {
                const months = Array.from({length: 12}, (_, i) => i + 1);
                
                return Promise.all(months.map(async month => {
                    const [monthlyProfit, monthlyCost] = await Promise.all([
                        calculateMonthlyProfit(month),
                        calculateMonthlyCost(month)
                    ]);

                    return {
                        month,
                        cost: monthlyCost,
                        profit: monthlyProfit
                    };
                }));
            }

            const [grossProfit, totalCost, monthlyData] = await Promise.all([
                calculateProfit(),
                calculateCost(),
                getMonthlyData()
            ]);

            return response(res, 200, {
                success: true,
                message: "Lấy ra tổng doanh số chi tiết thành công!",
                data: {
                    annual: {
                        cost: totalCost,
                        profit: grossProfit
                    },
                    monthly: monthlyData
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
    },

    status_order: async (req, res) => {
        try {
            const totalOrders = await Order.count();

            if (totalOrders === 0) {
                return response(res, 200, {
                    success: true,
                    data: {
                        pending: 0,
                        packing: 0,
                        canceled: 0,
                        fulfilled: 0,
                        percentages: {
                            pending: '0%',
                            packing: '0%',
                            canceled: '0%',
                            fulfilled: '0%'
                        }
                    },
                    message: "Thống kê trạng thái đơn hàng"
                });
            }

            const pendingCount = await Order.count({ where: { status: 'pending' } });
            const packingCount = await Order.count({ where: { status: 'packing' } });
            const canceledCount = await Order.count({ where: { status: 'canceled' } });
            const fulfilledCount = await Order.count({ where: { status: 'fulfilled' } });

            const calculatePercentage = (count) => ((count / totalOrders) * 100).toFixed(1) + '%';

            const result = {
                pending: pendingCount,
                packing: packingCount,
                canceled: canceledCount,
                fulfilled: fulfilledCount,
                percentages: {
                    pending: calculatePercentage(pendingCount),
                    packing: calculatePercentage(packingCount),
                    canceled: calculatePercentage(canceledCount),
                    fulfilled: calculatePercentage(fulfilledCount)
                }
            };

            return response(res, 200, {
                success: true,
                data: result,
                message: "Thống kê trạng thái đơn hàng"
            });
        }
        catch(error) {
            console.log(error);
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    best_seller_products: async (req, res) => {
        try {
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    vip_customers: async (req, res) => {
        try {
            const vipCustomers = await Account.findAll({
                where: {
                    customer_type: 'vip_customer'
                },
                limit: 10,
                order: [
                    ['created_at', 'DESC']
                ]
            });

            return response(res, 200, {
                success: true,
                message: "Thành công lấy ra danh sách khách quen",
                data: {
                    vip_customers: vipCustomers
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
}