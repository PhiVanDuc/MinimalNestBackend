const { ReturnGoods, ReturnGoodsItem, Variant, Inventory, sequelize } = require("../../../db/models");
const response = require("../../../utils/response");

const cancelMessages = [
    "Shipper đã đến lấy hàng nhưng không liên hệ được với khách.",
    "Khách không có nhà tại thời điểm lấy hàng.",
    "Khách chưa chuẩn bị hàng hoàn trả.",
    "Khách thay đổi ý định và không muốn trả hàng nữa.",
    "Thông tin địa chỉ lấy hàng không đầy đủ hoặc không xác định được vị trí.",
    "Thời tiết xấu hoặc điều kiện bất khả kháng khiến việc lấy hàng không thể thực hiện.",
    "Đơn vị vận chuyển huỷ lịch lấy hàng do lý do kỹ thuật hoặc vận hành.",
    "Khách yêu cầu dời lịch lấy hàng sang thời điểm khác."
];

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { returnGoodsId } = req.params;
        const { status, cancelMessage } = req.body;

        const cleanCancelMessage = cancelMessage?.trim();

        if (!returnGoodsId || !status || (status === "canceled" && !cleanCancelMessage)) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        const existingReturnGoods = await ReturnGoods.findByPk(returnGoodsId, { transaction });
        if (!existingReturnGoods) {
            await transaction.rollback();
            return response(res, 404, {
                success: false,
                message: "Không tìm thấy đơn hoàn trả hàng!"
            });
        }

        let updateData = {};

        if (status === "canceled") {
            updateData = {
                status: "canceled",
                cancel_message: cleanCancelMessage
            };
        }
        else {
            const random = Math.random();

            if (random <= 0.8) {
                const returnItems = await ReturnGoodsItem.findAll({
                    where: { return_goods_id: returnGoodsId },
                    include: [
                        {
                            model: Variant,
                            as: "variant",
                            include: [
                                {
                                    model: Inventory,
                                    as: "inventory"
                                }
                            ]
                        }
                    ],
                    transaction
                });

                for (const item of returnItems) {
                    const inventory = item.variant?.inventory;

                    if (inventory && item.return_quantity > 0) {
                        await Inventory.update({
                            total_quantity: sequelize.literal(`total_quantity + ${+item.return_quantity}`)
                        }, {
                            where: { id: inventory.id },
                            transaction
                        });
                    }
                }

                updateData.status = "fulfilled";
            }
            else {
                updateData = {
                    status: "canceled",
                    cancel_message: cancelMessages[Math.floor(Math.random() * cancelMessages.length)]
                };
            }
        }

        await existingReturnGoods.update(updateData, { transaction });
        await transaction.commit();

        return response(res, 200, {
            success: true,
            message: "Đã cập nhật đơn hoàn trả hàng thành công!"
        });
    } catch (error) {
        await transaction.rollback();

        console.error(error);
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
};