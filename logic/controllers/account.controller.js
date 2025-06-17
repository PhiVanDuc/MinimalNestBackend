require("dotenv").config();

const { Op } = require("sequelize");
const { Role, Account, sequelize } = require("../../db/models/index");

const bcrypt = require("bcryptjs");
const response = require("../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    get_accounts: async (req, res) => {
        try {
            const page = req.query?.page || 1;
            const name = (req.query?.name)?.trim() || "";

            // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
            const limit = +LIMIT;
            const offset = (+page - 1) * limit;

            const whereCondition = name ?
            {
                full_name: {
                    [Op.iLike]: `%${name}%`
                }
            } :
            {};

            const { count, rows } = await Account.findAndCountAll({
                limit,
                offset,
                where: whereCondition,
                order: [['created_at', 'DESC']],
                include: {
                    model: Role,
                    as: 'roles',
                    attributes: ["id", "slug", "role"],
                    through: { attributes: [] }
                }
            });

            return response(res, 200, {
                success: true,
                message: "Lấy danh sách tài khoản thành công!",
                data: {
                    totalItems: count,
                    pageSize: limit,
                    totalPages: Math.ceil(count / +limit),
                    currentPage: +page,
                    rows
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                succes: false,
                message: "Lỗi server!"
            })
        }
    },

    get_account: async (req, res) => {
        try {
            const accountId = req.params.accountId;

            // Kiểm tra dữ liệu
            if (!accountId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Tìm tài khoản
            const findAccount = await Account.findOne({
                where: { id: accountId },
                include: {
                    model: Role,
                    as: 'roles',
                    attributes: ["id", "slug", "role"],
                    through: { attributes: [] }
                }
            });

            if (!findAccount) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy tài khoản!"
                });
            }

            return response(res, 200, {
                success: true,
                message: "Lấy tài khoản thành công!",
                data: {
                    account: findAccount
                }
            });
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                succes: false,
                message: "Lỗi server!"
            })
        }
    },

    edit_account: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const accountId = req.params.accountId;
            const { roles, status } = req.body || {};

            // Kiểm tra dữ liệu
            if (!accountId || !roles || !status) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Kiểm tra xem có tìm thấy account hiện tại không
            const existingAccount = await Account.findOne({
                where: { id: accountId }
            });

            if (!existingAccount) {
                return response(res, 400, {
                    success: false,
                    message: "Không thể chỉnh sửa một tài khoản không tồn tại!"
                });
            }

            // Cập nhật account
            await existingAccount.update({
                status
            }, { transaction });
            await existingAccount.setRoles(roles, { transaction });
            await transaction.commit();
            
            return response(res, 200, {
                success: true,
                message: "Chỉnh sửa tài khoản thành công!",
                data: {
                    role: existingAccount
                }
            });
        }
        catch(error) {
            await transaction.rollback();
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    profile_change_info: async (req, res) => {
        try {
            const { accountId } = req.params || {};
            const { firstName, lastName, dateOfBirth } = req.body || {};

            if (!accountId || !firstName || !lastName) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin!"
                });
            }

            const account = await Account.findByPk(accountId);
            if (!account) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy tài khoản!"
                });
            }

            account.first_name = firstName;
            account.last_name = lastName;
            account.full_name = `${lastName} ${firstName}`;
            account.date_of_birth = dateOfBirth || null;

            await account.save();

            return response(res, 200, {
                success: true,
                message: "Cập nhật thông tin thành công!",
            });
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    profile_change_password: async (req, res) => {
        try {
            const { accountId } = req.params || {};
            const { oldPassword, newPassword, confirmNewPassword } = req.body || {};

            if (!accountId || !oldPassword || !newPassword || !confirmNewPassword) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin!"
                });
            }

            const account = await Account.findOne({
                where: { id: accountId }
            });

            if (!account) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy tài khoản!"
                });
            }

            const isMatch = await bcrypt.compare(oldPassword, account.password);
            if (!isMatch) {
                return response(res, 401, {
                    success: false,
                    message: "Mật khẩu cũ không đúng!"
                });
            }

            if (newPassword !== confirmNewPassword) {
                return response(res, 400, {
                    success: false,
                    message: "Mật khẩu xác nhận không khớp!"
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await account.update({
                password: hashedPassword
            });

            return response(res, 200, {
                success: true,
                message: "Đổi mật khẩu thành công!"
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