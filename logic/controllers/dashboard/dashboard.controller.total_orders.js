const { Order, Sequelize } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
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
}