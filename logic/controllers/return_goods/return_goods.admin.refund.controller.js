require("dotenv").config();
const { ReturnGoods } = require("../../../db/models");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const { returnGoodsId } = req.params || {};

        const returnGoods = await ReturnGoods.findByPk(returnGoodsId);
        if (!returnGoods) {
            return response(res, 404, {
                success: false,
                message: "Không tìm thấy đơn hoàn trả hàng!"
            })
        }

        if (returnGoods.is_refunded) {
            return response(res, 400, {
                success: false,
                message: "Đơn hoàn trả hàng này đã được hoàn tiền!"
            });
        }

        const { payment_method, payment_intent_id, refund_amount } = returnGoods;

        if (payment_method === "stripe") {
            if (!payment_intent_id) {
                return response(res, 400, {
                    success: false,
                    message: "Thiếu id đơn stripe để hoàn tiền stripe!"
                });
            }

            const refund = await stripe.refunds.create({
                payment_intent: payment_intent_id,
                amount: parseInt(refund_amount)
            });

            if (refund.status !== "succeeded") {
                return response(res, 500, {
                    success: false,
                    message: "Hoàn tiền từ stripe thất bại!"
                });
            }
        }

        returnGoods.is_refunded = true;
        await returnGoods.save();

        return response(res, 200, {
            success: true,
            message: "Hoàn tiền cho đơn hoàn trả hàng thành công!"
        })
    }
    catch(error) {
        console.log(error);

        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        })
        
    }
}