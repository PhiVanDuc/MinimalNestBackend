const { Order, sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const counts = await Order.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                status: {
                    [Op.in]: ['pending', 'packing', 'canceled', 'fulfilled']
                }
            },
            group: ['status']
        });

        const result = {
            pending: 0,
            packing: 0,
            canceled: 0,
            fulfilled: 0
        };

        counts.forEach(item => {
            result[item.status] = parseInt(item.get('count'));
        });

        return response(res, 200, {
            success: true,
            message: "Thành công lấy ra số lượng các trạng thái đơn hàng!",
            data: result
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