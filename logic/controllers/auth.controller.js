require('dotenv').config();
const { Account, Role, Permission, OTP } = require("../../db/models/index");

const bcrypt = require("bcryptjs");
const response = require("../../utils/response");
const emailService = require("../../utils/mailer");
const { create_token } = require("../../utils/token");

module.exports = {
    create_otp: async (req, res) => {
        try {
            const { email } = req.body || {};

            // Kiểm tra dữ liệu
            if (!email) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Tạo 6 số ngẫu nhiên
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Băm mã OTP
            const salt = bcrypt.genSaltSync(10);
            const hashOtp = bcrypt.hashSync(otp, salt);

            // Gửi otp vào gmail
            const sendEmail = await emailService({
                to: email,
                subject: "Xác thực tài khoản - Minimal Nest",
                html: `
                    <p>Mã OTP: ${otp}</p>
                `
            });

            if (!sendEmail.success) {
                return response(res, sendEmail.code, {
                        success: false,
                        message: "Không thể gửi email, vui lòng thử lại!"
                    }
                );
            }

            // Lưu mã OTP vào database
            const now = new Date();
            await OTP.create({
                email: email,
                code: hashOtp,
                expired_at: new Date(now.getTime() + 5 * 60 * 1000)
            });

            return response(res, 200, {
                success: true,
                message: "Vui lòng truy cập vào gmail để nhập mã OTP!",
            });
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!",
                error
            });
        }
    },

    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password, otp } = req.body || {};
            
            // Kiểm tra dữ liệu
            if (!firstName || !lastName || !email || !password || !otp) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }
            
            // Kiểm tra tài khoản đã tồn tại chưa
            const findAccount = await Account.findOne({
                where: { email: email }
            });

            if (findAccount) {
                return response(res, 409, {
                        success: false,
                        message: `Tài khoản với email ${email} đã tồn tại!`
                    }
                );
            }

            // Kiểm tra mã otp
            const findOtp = await OTP.findOne({
                where: { email: email },
                order: [
                    ['created_at', 'DESC']
                ],
                limit: 1
            });

            const compareOtp = bcrypt.compareSync(otp, findOtp?.code || "not found");
            if (!findOtp || !compareOtp) {
                return response(res, 404, {
                    success: false,
                    message: `Mã OTP ${otp} không tồn tại!`
                });
            }

            const now = new Date();
            const expiredAt = new Date(findOtp.expired_at);

            if (expiredAt < now) {
                return response(res, 410, {
                    success: false,
                    message: `Mã OTP ${otp} đã hết hạn!`
                });
            }

            // Xóa mã otp sau khi đã dùng
            await OTP.destroy({
                where: { email: email }
            });

            // Băm mật khẩu
            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(password, salt);

            // Thêm tài khoản vào database
            const createAccount = await Account.create({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: hashPassword
            });

            const accountData = { ...createAccount.get() };
            delete accountData.password;

            return response(res, 200, {
                success: true,
                message: "Đã đăng ký tài khoản thành công!"
            });
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!",
                error
            });
        }
    },

    sign_in: async (req, res) => {
        try {
            const { email, password } = req.body || {};
            
            // Kiểm tra dữ liệu
            if (!email || !password) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Kiểm tra tài khoản đã tồn tại chưa
            const findAccount = await Account.findOne({
                where: { email: email },
                include: {
                    model: Role,
                    as: "roles",
                    attributes: ["slug"],
                    through: {
                        attributes: []
                    },
                    include: {
                        model: Permission,
                        as: "permissions",
                        attributes: ["slug"],
                        through: {
                            attributes: []
                        },
                    }
                }
            });

            if (!findAccount) {
                return response(res, 401, {
                        success: false,
                        message: `Email hoặc mật khẩu không đúng!`
                    }
                );
            }
 
            // Xử lý nếu tài khoản bại khóa
            if (findAccount.status !== "active") {
                return response(res, 403, {
                    success: false,
                    message: "Tài khoản của bạn đã bị khóa!"
                });
            }

            // Lấy ra tất cả các permissions của tài khoản
            const permissionSlugs = findAccount.roles.flatMap(role =>
                role.permissions.map(permission => permission.slug)
            );
            const uniquePermissionSlugs = [...new Set(permissionSlugs)];

            // Kiểm tra mật khẩu
            const comparePassword = bcrypt.compareSync(password, findAccount.password);
            if (!comparePassword) {
                return response(res, 401, {
                        success: false,
                        message: `Email hoặc mật khẩu không đúng!`
                    }
                );
            }

            const accountData = {
                id: findAccount.id,
                first_name: findAccount.first_name,
                last_name: findAccount.last_name,
                email: findAccount.email,
                status: findAccount.status,
                permissions: uniquePermissionSlugs
            }

            const accessToken = create_token(accountData);
            const refreshToken = create_token({ id:findAccount.id }, "7d");

            return response(res, 200, {
                success: true,
                message: "Đăng nhập thành công!",
                data: {
                    account: accountData,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            });
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!",
                error
            });
        }
    },

    reset_password: async (req, res) => {
        try {
            const { email, newPassword, otp } = req.body || {};

            // Kiểm tra dữ liệu
            if (!email || !newPassword || !otp) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Kiểm tra tài khoản đã tồn tại chưa
            const findAccount = await Account.findOne({
                where: { email: email }
            });

            if (!findAccount) {
                return response(res, 409, {
                        success: false,
                        message: `Tài khoản với email ${email} chưa tồn tại!`
                    }
                );
            }

            // Kiểm tra mã otp
            const findOtp = await OTP.findOne({
                where: { email: email },
                order: [
                    ['created_at', 'DESC']
                ],
                limit: 1
            });

            const compareOtp = bcrypt.compareSync(otp, findOtp?.code || "not found");
            if (!findOtp || !compareOtp) {
                return response(res, 404, {
                    success: false,
                    message: `Mã OTP ${otp} không tồn tại!`
                });
            }

            const now = new Date();
            const expiredAt = new Date(findOtp.expired_at);

            if (expiredAt < now) {
                return response(res, 410, {
                    success: false,
                    message: `Mã OTP ${otp} đã hết hạn!`
                });
            }

            // Xóa mã otp sau khi đã dùng
            await OTP.destroy({
                where: { email: email }
            });

            // Băm mật khẩu
            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(newPassword, salt);

            // Cập nhật lại mật khẩu vào database
            await Account.update(
                { password: hashPassword },
                { where: { email: email } }
            );

            return response(res, 200, {
                success: true,
                message: "Đã thay đổi mật khẩu thành công!"
            });
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!",
                error
            });
        }
    }
}