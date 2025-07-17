const { Event } = require("../../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../../utils/response");

module.exports = {
    get_events: async (req, res) => {
        try {
            const now = new Date();

            const events = await Event.findAll({
                where: {
                    start_date: { [Op.lte]: now },
                    end_date: { [Op.gt]: now }
                }
            });
            return response(res, 200, {
                success: true,
                message: "Đã lấy ra danh sách sự kiện!",
                data: {
                    events
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