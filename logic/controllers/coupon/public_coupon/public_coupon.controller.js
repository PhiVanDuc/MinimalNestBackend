require("dotenv").config();
const { Event, Coupon } = require("../../../../db/models/index");

const response = require("../../../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    get_public_coupons: async (req, res) => {
        try {
            const page = req.query?.page || 1;
            const limit = +req.query?.limit || +LIMIT;
            const event = req.query?.event || null;

            const offset = (+page - 1) * limit;

            const { count, rows } = await Coupon.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Event,
                        as: 'event',
                        attributes: ["id", "event", "image", "start_date", "end_date"],
                        where: {
                            event_type: "discount",
                            ...(event && {
                                slug: event
                            })
                        }
                    }
                ]
            });

            return response(res, 200, {
                success: true,
                message: "Đã lấy ra danh sách phiếu giảm giá!",
                data: {
                    totalItems: count,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    currentPage: +page,
                    rows
                }
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