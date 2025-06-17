const { Color } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = {
    get_colors: async (req, res) => {
        try {
            const colors = await Color.findAll();

            return response(res, 200, {
                success: false,
                message: "Lấy ra danh sách màu sắc thành công!",
                data: {
                    colors
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
}