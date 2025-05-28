const { LivingSpace } = require("../../db/models/index");
const response = require("../../utils/response");

module.exports = {
    get_living_spaces: async (req, res) => {
        try {
            const living_spaces = await LivingSpace.findAll();

            return response(res, 200, {
                success: true,
                message: "Thành công lấy ra danh sách không gian sống!",
                data: {
                    living_spaces
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: true,
                message: "Lỗi server!"
            })
        }
    }
}