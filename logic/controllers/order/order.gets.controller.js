const { Order, OrderItem } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const accountId = req.params?.accountId;
        const status = req.query?.status;

        if (!accountId || !status) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        let orders;

        if (status === "all") {
            orders = await Order.findAll({
                where: { account_id: accountId },
                include: [
                    {
                        model: OrderItem,
                        as: "order_items"
                    }
                ],
                order: [["created_at", "DESC"]]
            });
        }
        else {
            orders = await Order.findAll({
                where: {
                    account_id: accountId,
                    status: status
                },
                include: [
                    {
                        model: OrderItem,
                        as: "order_items"
                    }
                ],
                order: [["created_at", "DESC"]]
            });
        }

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách đơn hàng thành công!",
            data: {
                orders
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