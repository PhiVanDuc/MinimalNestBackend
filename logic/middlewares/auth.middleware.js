require('dotenv').config();

const response = require("../../utils/response");
const { verify } = require("../../utils/token");

const authMiddleware = async (req, res, next) => {
    try {
        const AUTH_MIDDLEWARE=process.env.AUTH_MIDDLEWARE;

        if (AUTH_MIDDLEWARE === "allow") {
            const token = req.headers.authorization?.split(' ')[1];
            
            // Kiểm tra dữ liệu
            if (!token) {
                return response(res, 401, {
                    success: false,
                    message: "Vui lòng đăng nhập để tiếp tục!"
                })
            }

            // Kiểm tra tính hợp lệ của token
            const verifyToken = verify(token);
            if (!verifyToken?.valid && !verifyToken?.expired) {
                return response(res, 401, {
                    success: false,
                    message: "Vui lòng đăng nhập để tiếp tục!"
                })
            }
            else if (verifyToken?.expired) {
                return response(res, 410, {
                    success: false,
                    message: "Phiên đăng nhập đã hết hạn!"
                })
            }

            req.user = verifyToken?.decoded;
        }

        next();
    }
    catch(error) {
        console.log(error);

        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        })
    }
}

module.exports = authMiddleware;