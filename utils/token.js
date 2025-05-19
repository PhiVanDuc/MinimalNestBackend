require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = {
    create_token: (payload, time = '10s', options = {}) => {
        const secret = process.env.JWT_SECRET;

        return jwt.sign(
            payload,
            secret,
            {
                expiresIn: time,
                ...options,
            }
        ) 
    },

    verify: (token) => {
        const secret = process.env.JWT_SECRET;

        try {
            const decoded = jwt.verify(token, secret);
            return {
                valid: true,
                expired: false,
                decoded,
            };
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return {
                    valid: false,
                    expired: true,
                    message: 'Hệ thống đã hết phiên đăng nhập.',
                };
            } else if (err.name === 'JsonWebTokenError') {
                return {
                    valid: false,
                    expired: false,
                    message: 'Phiên đăng nhập hệ thống đã bị chỉnh sửa!',
                };
            } else {
                return {
                    valid: false,
                    expired: false,
                    message: 'Phiên đăng nhập hệ thống đã bị chỉnh sửa!',
                };
            }
        }
    }
}