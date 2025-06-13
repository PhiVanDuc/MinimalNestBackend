require("dotenv").config();

const { Op } = require("sequelize");
const { Coupon, Event } = require("../../../../db/models/index");

const response = require("../../../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    get_coupons: async (req, res) => {
        try {
            const all = req.query?.all;
            const page = req.query?.page || 1;
            const code = (req.query?.code)?.trim() || "";

            if (!all) {
                // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
                const limit = +LIMIT;
                const offset = (+page - 1) * limit;

                const whereCondition = code ?
                {
                    code: {
                        [Op.iLike]: `%${code}%`
                    }
                } :
                {};

                const { count, rows } = await Coupon.findAndCountAll({
                    limit,
                    offset,
                    where: whereCondition,
                    order: [['created_at', 'DESC']],
                    include: [
                        {
                            model: Event,
                            as: 'event',
                        }
                    ]
                });

                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách phiếu giảm giá thành công!",
                    data: {
                        totalItems: count,
                        pageSize: limit,
                        totalPages: Math.ceil(count / limit),
                        currentPage: +page,
                        rows
                    }
                });
            }
            else {
                const allCoupons = await Coupon.findAll();
                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách phiếu giảm giá thành công!",
                    data: {
                        coupons: allCoupons
                    }
                })
            }
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    get_coupon: async (req, res) => {
        try {
            const couponId = req.params?.couponId;

            // Kiểm tra dữ liệu
            if (!couponId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Tìm phiếu giảm giá
            const findCoupon = await Coupon.findByPk(couponId, {
                include: {
                    model: Event,
                    as: 'event',
                }
            });

            if (!findCoupon) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy phiếu giảm giá!"
                });
            }

            return response(res, 200, {
                success: true,
                message: "Lấy vai trò thành công!",
                data: {
                    coupon: findCoupon
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
    },

    add_coupon: async (req, res) => {
        try {
            const { event, code, desc, discountType, discountPrice, quantity, minOrderTotal, minItems, customerType } = req.body || {};

            // Kiểm tra dữ liệu
            if (!event?.id || !code || !desc || !discountType || !discountPrice || !quantity || !customerType) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            const addCoupon = await Coupon.create({
                event_id: event?.id,
                code,
                desc,
                discount_type: discountType,
                discount_price: discountPrice,
                quantity: quantity,
                min_order_total: minOrderTotal,
                min_items: minItems,
                customer_type: customerType
            });

            return response(res, 200, {
                success: true,
                message: "Thêm phiếu giảm giá thành công!",
                data: {
                    coupon: addCoupon
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
    },

    edit_coupon: async (req, res) => {
        try {
            const couponId = req.params.couponId;
            const { event, code, desc, discountType, discountPrice, quantity, minOrderTotal, minItems, customerType } = req.body || {};

            // Kiểm tra dữ liệu
            if (!event?.id || !code || !desc || !discountType || !discountPrice || !quantity || !customerType) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Kiểm tra xem có tìm thấy phiếu giảm giá hay không
            const findCoupon = await Coupon.findByPk(couponId, {
                include: {
                    model: Event,
                    as: "event"
                }
            });

            if (!findCoupon) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể cập nhập phiếu giảm giá không tồn tại!"
                })
            }

            // Cập nhật phiếu giảm giá
            const updateCoupon = await findCoupon.update({
                event_id: event?.id,
                code,
                desc,
                discount_type: discountType,
                discount_price: discountPrice,
                quantity: quantity,
                min_order_total: minOrderTotal,
                min_items: minItems,
                customer_type: customerType
            });

            return response(res, 200, {
                success: true,
                message: "Cập nhật phiếu giảm giá thành công!",
                data: {
                    coupon: updateCoupon
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
    },

    delete_coupon: async (req, res) => {
        try {
            const couponId = req.params?.couponId;

            if (!couponId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Kiểm tra xem có tìm thấy phiếu giảm giá hay không
            const findCoupon = await Coupon.findByPk(couponId);

            if (!findCoupon) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể cập nhập phiếu giảm giá không tồn tại!"
                })
            }

            // Xóa phiếu giảm giá
            await findCoupon.destroy();

            return response(res, 200, {
                success: true,
                message: "Xóa phiếu giảm giá thành công!"
            });
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    }
}