const { Order, OrderItem, ReservedOrder, Coupon, Cart, CartItem, sequelize } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            reserved_order_id,
            user,
            products,
            coupon,
            message,
            totalOrder,
            totalOrderDiscount,
            paymentMethod,
            paymentIntentId
        } = req.body;

        // Kiểm tra đầu vào cơ bản
        if (!reserved_order_id || !user || !products?.length || !totalOrder || !paymentMethod || (paymentMethod === "stripe" && !paymentIntentId)) {
            await t.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu hợp lệ!"
            });
        }

        if (paymentMethod === "stripe" && !paymentIntentId) {
            await t.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu cho thanh toán Stripe!"
            });
        }

        // Kiểm tra reserved order còn thời gian giữ chỗ không
        if (reserved_order_id) {
            const reservedOrder = await ReservedOrder.findOne({
                where: { id: reserved_order_id },
                transaction: t
            });

            if (!reservedOrder) {
                await t.rollback();
                return response(res, 403, {
                    success: false,
                    message: "Đơn hàng tạm thời đã hết thời gian giữ chỗ!"
                });
            }

            const now = new Date();
            const expiredAt = new Date(reservedOrder.expired_at);

            if (now > expiredAt || reservedOrder?.is_paid) {
                await t.rollback();
                return response(res, 403, {
                    success: false,
                    message: "Đơn hàng tạm thời đã hết thời gian giữ chỗ!"
                });
            }
        }

        // Kiểm tra coupon có hợp lệ không
        let validCoupon = null;

        if (coupon?.id) {
            const foundCoupon = await Coupon.findOne({
                where: { id: coupon.id },
                include: ["event"],
                transaction: t
            });

            const now = new Date();
            const expiredAt = foundCoupon?.expired_at && new Date(foundCoupon.expired_at);
            const isExpired = expiredAt && now > expiredAt;
            const isOutOfQuantity = foundCoupon?.quantity <= 0;

            if (foundCoupon && !isExpired && !isOutOfQuantity) {
                validCoupon = foundCoupon;
                await foundCoupon.decrement("quantity", { by: 1, transaction: t });
            } else {
                console.log("Coupon không hợp lệ:");
                if (!foundCoupon) console.log("- Không tồn tại");
                if (isExpired) console.log("- Đã hết hạn");
                if (isOutOfQuantity) console.log("- Hết số lượng");
            }
        }

        // Chuẩn bị dữ liệu để tạo đơn hàng
        const orderData = {
            account_id: user?.account_id || null,
            full_name: user?.full_name,
            phone_number: user?.phone_number,
            address: user?.address,
            ...(validCoupon && {
                event: validCoupon?.event?.event,
                coupon_code: validCoupon?.code,
                discount_type: validCoupon?.discount_type,
                discount_amount: validCoupon?.discount_price,
                ...(totalOrderDiscount && { total_order_discount: totalOrderDiscount })
            }),
            ...(message && { message: message }),
            payment_method: paymentMethod,
            ...((paymentIntentId && paymentMethod === "stripe") && { payment_intent_id: paymentIntentId }),
            total_order: totalOrder
        };

        const createdOrder = await Order.create(orderData, { transaction: t });

        // Tạo order item
        const orderItems = products.map(prod => ({
            order_id: createdOrder.id,
            product_id: prod?.product?.id,
            variant_id: prod?.variant_id,
            product_name: prod?.product?.product,
            image: prod?.image?.url,
            color: prod?.color?.color,
            code_color: prod?.color?.code,
            size: prod?.size?.size,
            size_desc: prod?.size?.desc,
            quantity: prod?.quantity,
            cost_price: prod?.cost_price,
            price_discount: prod?.price_discount || null,
            price: prod?.price,
            sub_total: prod?.price_discount
                ? prod?.price_discount * prod?.quantity
                : prod?.price * prod?.quantity
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        if (reserved_order_id) {
            await ReservedOrder.update(
                { is_paid: true },
                { where: { id: reserved_order_id }, transaction: t }
            );
        }

        const cart = await Cart.findOne({
            where: { account_id: user?.account_id },
            transaction: t
        });

        if (cart) {
            const itemsToDelete = products.map((prod) => {
                return {
                    product_id: prod?.product?.id,
                    variant_id: prod?.variant_id
                }
            });

            for (const item of itemsToDelete) {
                await CartItem.destroy({
                    where: {
                        cart_id: cart.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id
                    },
                    transaction: t
                });
            }
        }

        await t.commit();

        return response(res, 200, {
            success: true,
            message: "Đã tạo mới đơn hàng thành công!",
            data: {
                order_id: createdOrder.id
            }
        });

    } catch (error) {
        console.log("Lỗi khi tạo đơn hàng:", error);
        await t.rollback();

        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
};