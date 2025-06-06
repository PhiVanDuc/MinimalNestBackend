const { ProductType } = require("../../db/models/index");

const response = require("../../utils/response");

module.exports = {
    get_product_types: async (req, res) => {
        try {
            const allProductTypes = await ProductType.findAll();

            return response(res, 200, {
                success: true,
                message: "Thành công lấy danh sách loại sản phẩm!",
                data: {
                    product_types: allProductTypes
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
}