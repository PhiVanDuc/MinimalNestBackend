require("dotenv").config();

const Stripe = require('stripe');
const response = require("../../../utils/response");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 

module.exports = async (req, res) => {
    try {
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'vnd',
            automatic_payment_methods: { enabled: true }
        });

        return response(res, 200, {
            success: true,
            message: "Đã tạo đơn thanh toán đang chờ xử lý từ stripe thành công!",
            data: {
                client_secret: paymentIntent.client_secret
            }
        })
    }
    catch(error) {
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}