require("dotenv").config();
const { Order, OrderItem } = require("../../../db/models/index");
const { Sequelize } = require("sequelize");

const dateFnsTz = require("date-fns-tz");
const { fromZonedTime } = dateFnsTz;
const response = require("../../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = async (req, res) => {
    try {
        const page = req.query?.page || 1;
        const status = (req.query?.status)?.trim() || "";
        const from = req.query?.from;
        const to = req.query?.to;

        const limit = +LIMIT;
        const offset = (+page - 1) * limit;

        const whereClause = {};

        if (status && status !== "all") {
            whereClause.status = status;
        }

        if (from && to) {
            const timeZone = 'Asia/Ho_Chi_Minh';

            const fromDate = fromZonedTime(`${from} 00:00:00`, timeZone);
            const toDate = fromZonedTime(`${to} 23:59:59`, timeZone);

            whereClause.created_at = {
                [Sequelize.Op.between]: [fromDate, toDate],
            };
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: OrderItem,
                    as: "order_items"
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách vai trò thành công!",
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
        });
    }
}