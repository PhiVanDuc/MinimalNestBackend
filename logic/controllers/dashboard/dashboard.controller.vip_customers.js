const { Account } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const accounts = await Account.findAll();

        return response(res, 200, {
            success: true,
            message: "Thành công lấy ra các khách hàng quen!",
            data: {
                accounts: accounts
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