const { ReturnGoods, ReturnGoodsItem, ProofImage } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const accountId = req.params?.accountId;
        const status = req.query?.status;

        if (!accountId || !status) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        let return_goods;

        if (status === "all") {
            return_goods = await ReturnGoods.findAll({
                where: { account_id: accountId },
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
                order: [["created_at", "DESC"]]
            });
        }
        else {
            return_goods = await ReturnGoods.findAll({
                where: {
                    account_id: accountId,
                    status: status
                },
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
                order: [["created_at", "DESC"]]
            });
        }

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách yêu cầu trả hàng thành công!",
            data: {
                return_goods
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