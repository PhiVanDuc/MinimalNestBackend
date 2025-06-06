const { Discount } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const generalDiscountId = req.params?.generalDiscountId;

        await Discount.destroy({
            where: { id: generalDiscountId }
        });

        return response(res, 200, {
            success: true,
            message: "Xóa giảm giá chung thành công!"
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