const { Account, Order, Sequelize } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const accounts = await Account.findAll({
            include: [{
                model: Order,
                as: "orders",
                attributes: []
            }],
            attributes: {
                include: [
                    ...Object.keys(Account.getAttributes()),
                    [Sequelize.fn("COUNT", Sequelize.col("orders.id")), "order_count"]
                ]
            },
            group: ["Account.id"],
            having: Sequelize.literal(`COUNT(orders.id) >= 10`),
            order: [[Sequelize.literal("order_count"), "DESC"]],
        });

        return response(res, 200, {
            success: true,
            message: "Thành công lấy ra các khách hàng quen!",
            data: {
                accounts: accounts
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