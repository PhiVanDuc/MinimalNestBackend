require("dotenv").config();

const { ReturnGoods, ReturnGoodsItem, ProofImage } = require("../../../db/models");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const { returnGoodsId } = req.params;

        if (!returnGoodsId) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!",
            });
        }

        const returnGoods = await ReturnGoods.findOne({
            where: { id: returnGoodsId },
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
            ]
        });

        if (!returnGoods) {
            return response(res, 404, {
                success: false,
                message: "Không tìm thấy đơn hoàn trả hàng!"
            });
        }

        return response(res, 200, {
            success: true,
            message: "Lấy chi tiết đơn hoàn trả hàng thành công!",
            data: {
                return_goods: returnGoods
            }
        });
    } catch (error) {
        console.error(error);

        return response(res, 500, {
            success: false,
            message: "Lỗi server!",
        });
    }
};
