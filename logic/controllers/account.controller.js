require("dotenv").config();

const { Op } = require("sequelize");
const { Role, Account, sequelize } = require("../../db/models/index");
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
    }
}