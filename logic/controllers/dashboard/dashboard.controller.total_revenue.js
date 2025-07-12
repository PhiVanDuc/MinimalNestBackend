const { Order, ReturnGoods, Sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const orders = await Order.findAll({
            attributes: [
                'id',
                'total_order',
                'total_order_discount'
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
            raw: true
        });

        const totalRevenue = orders.reduce((sum, order) => {
            const orderAmount = order.total_order_discount !== null ? 
                                    order.total_order_discount : 
                                    order.total_order;
            return sum + parseFloat(orderAmount);
        }, 0);

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
}