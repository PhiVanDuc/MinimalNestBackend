const { Product } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const totalProducts = await Product.count();
        return response(res, 200, {
            success: true,
            message: "Lấy ra tổng số sản phẩm đang có thành công!",
            data: {
                total_products: totalProducts
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