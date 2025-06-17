require("dotenv").config();

const { ReturnGoods, ReturnGoodsItem, ProofImage } = require("../../../db/models");
const { Sequelize } = require("sequelize");

const dateFnsTz = require("date-fns-tz");
const { fromZonedTime } = dateFnsTz;
const response = require("../../../utils/response");

const LIMIT = process.env.LIMIT || 10;

module.exports = async (req, res) => {
    try {
        const page = parseInt(req.query?.page) || 1;
        const status = req.query?.status?.trim() || "";
        const from = req.query?.from;
        const to = req.query?.to;

        const limit = +LIMIT;
        const offset = (page - 1) * limit;

        const whereClause = {};

        // Lọc theo status nếu có
        if (status && status !== "all") {
            whereClause.status = status;
        }

        // Lọc theo khoảng ngày
        if (from && to) {
            const timeZone = 'Asia/Ho_Chi_Minh';
            const fromDate = fromZonedTime(`${from} 00:00:00`, timeZone);
            const toDate = fromZonedTime(`${to} 23:59:59`, timeZone);

            whereClause.created_at = {
                [Sequelize.Op.between]: [fromDate, toDate],
            };
        }

        // Truy vấn
        const { count, rows } = await ReturnGoods.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: ReturnGoodsItem,
                    as: "return_goods_items",
                    include: [
                        {
                            model: ProofImage,
                            as: "proof_images"
                        }
                    ]
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách đơn hoàn thành công!",
            data: {
                totalItems: count,
                pageSize: limit,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                rows
            }
        });
    } catch (error) {
        console.error(error);
        return response(res, 500, {
            success: false,
            message: "Lỗi server khi lấy đơn hoàn!"
        });
    }
};
