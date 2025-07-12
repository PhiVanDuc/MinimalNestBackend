require("dotenv").config();

const { sequelize, Order, OrderItem, Inventory, Account, ReturnGoods, Variant } = require("../../../db/models/index");
const { Op } = require("sequelize");

const Stripe = require("stripe");
const response = require("../../../utils/response");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const cancelMessages = [
    "Đơn vị giao hàng đã cố gắng liên hệ nhiều lần nhưng không thành công.",
    "Khách hàng không đồng ý nhận đơn khi giao tới.",
    "Đơn hàng đã được giao lại nhiều lần nhưng đều không có người nhận.",
    "Thông tin địa chỉ không đầy đủ hoặc không xác định được vị trí giao hàng.",
    "Thời tiết xấu hoặc điều kiện bất khả kháng khiến đơn không thể giao đúng hẹn.",
    "Đơn hàng gặp sự cố trong quá trình vận chuyển nên không thể hoàn tất giao hàng.",
    "Nhà vận chuyển huỷ đơn do lý do kỹ thuật hoặc vận hành."
];

async function restoreInventory(orderId, transaction, status) {
    const orderItems = await OrderItem.findAll({
        where: { order_id: orderId },
        include: [{
            model: Variant,
            as: 'variant',
            include: [{
                model: Inventory,
                as: 'inventory'
            }]
        }],
        transaction
    });

    for (const item of orderItems) {
        if (item.variant?.inventory && item.quantity > 0) {
            const updateData = status === "fulfilled"
                ? {
                    reserved_quantity: sequelize.literal(`reserved_quantity - ${item.quantity}`),
                    total_quantity: sequelize.literal(`total_quantity - ${item.quantity}`)
                }
                : {
                    reserved_quantity: sequelize.literal(`reserved_quantity - ${item.quantity}`)
                };

            await Inventory.update(updateData, {
                where: { id: item.variant.inventory.id },
                transaction
            });
        }
    }
}

async function handleCancelOrders(cancelInfo, transaction) {
    let count = 0;

    for (const { id, message } of cancelInfo) {
        if (!id || !message) continue;

        const order = await Order.findOne({ where: { id }, transaction });
        if (!order) continue;

        const [updated] = await Order.update({
            status: "canceled",
            cancel_message: message
        }, { where: { id }, transaction });

        if (updated > 0) {
            count++;
            await restoreInventory(id, transaction, "canceled");

            if (order.payment_method === "stripe" && order.payment_intent_id) {
                try {
                    await stripe.refunds.create({ payment_intent: order.payment_intent_id });
                } catch (err) {
                    console.log("Refund thất bại:", id, err);
                    throw new Error("Refund thất bại");
                }
            }
        }
    }

    return count;
}

async function updateCustomerType(accountId, transaction) {
    const fulfilledOrders = await Order.findAll({
        where: {
            account_id: accountId,
            status: "fulfilled"
        },
        attributes: ["id"],
        transaction
    });
    const totalFulfilled = fulfilledOrders.length;

    const returnGoods = await ReturnGoods.findAll({
        where: { account_id: accountId },
        attributes: ["id"],
        transaction
    });
    const totalReturned = returnGoods.length;

    const successfulCount = Math.max(totalFulfilled - totalReturned, 0);

    let customer_type = "first_time_customer";
    if (successfulCount >= 5) {
        customer_type = "vip_customer";
    } else if (successfulCount >= 1) {
        customer_type = "new_customer";
    }

    await Account.update({ customer_type }, {
        where: { id: accountId },
        transaction
    });
}

async function handleShippingOrders(orderIds, transaction) {
    let count = 0;

    for (const orderId of orderIds) {
        const order = await Order.findOne({ where: { id: orderId }, transaction });
        if (!order) continue;

        let updateData;
        const random = Math.random();

        if (random <= 0.8) {
            updateData = { status: "fulfilled" };
        } else {
            updateData = {
                status: "canceled",
                cancel_message: cancelMessages[Math.floor(Math.random() * cancelMessages.length)]
            };
        }

        const [updated] = await Order.update(updateData, {
            where: { id: orderId },
            transaction
        });

        if (updated > 0) {
            count++;
            await restoreInventory(orderId, transaction, updateData.status);

            if (updateData.status === "fulfilled") {
                await updateCustomerType(order.account_id, transaction);
            }
            else if (order.payment_method === "stripe" && order.payment_intent_id) {
                try {
                    await stripe.refunds.create({ payment_intent: order.payment_intent_id });
                } catch (err) {
                    console.log("Refund shipping thất bại:", orderId, err);
                    throw new Error("Refund thất bại khi huỷ trong shipping");
                }
            }
        }
    }

    return count;
}

async function handleOtherStatus(orderIds, status, transaction) {
    const [updated] = await Order.update({ status }, {
        where: { id: orderIds },
        transaction
    });

    return updated;
}

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { status, cancelInfo, orderIds } = req.body;

        if (!status) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp trạng thái đơn hàng!"
            });
        }

        let count = 0;

        if (status === "canceled") {
            if (!Array.isArray(cancelInfo) || cancelInfo.length === 0) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp danh sách đơn cần huỷ kèm lý do!"
                });
            }

            count = await handleCancelOrders(cancelInfo, transaction);

        } else if (status === "shipping") {
            if (!Array.isArray(orderIds) || orderIds.length === 0) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp danh sách orderIds để cập nhật trạng thái!"
                });
            }

            count = await handleShippingOrders(orderIds, transaction);

        } else {
            if (!Array.isArray(orderIds) || orderIds.length === 0) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp danh sách orderIds để cập nhật trạng thái!"
                });
            }

            count = await handleOtherStatus(orderIds, status, transaction);
        }

        await transaction.commit();

        if (count === 0) {
            return response(res, 404, {
                success: false,
                message: "Không có đơn hàng nào được cập nhật!"
            });
        }

        return response(res, 200, {
            success: true,
            message: `Đã cập nhật trạng thái cho ${count} đơn hàng thành công!`
        });

    } catch (error) {
        await transaction.rollback();
        console.log("Lỗi khi cập nhật đơn hàng:", error.message);
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
};
