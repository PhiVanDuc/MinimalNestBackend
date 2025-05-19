const { Account, Role, Permission } = require("../../db/models/index");

const response = require("../../utils/response");
const { verify, create_token } = require("../../utils/token");

module.exports = {
    verify_token: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            return response(res, 200, {
                success: true,
                message: "Đã hoàn thành kiểm tra phiên đăng nhập!",
                data: verify(token)
            });
        }
        catch (error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server"
            });
        }
    },

    refresh_access_token: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            // Kiểm tra dữ liệu
            if (!token) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Decode lấy id tài khoản
            const isValid = verify(token);
            if (!isValid.valid || isValid.expired) {
                return response(res, 401, {
                    success: false,
                    message: "Vui lòng đăng xuất!"
                });
            }

            // Kiểm tra tài khoản đã tồn tại chưa
            const decoded = isValid?.decoded;
            const findAccount = await Account.findByPk(decoded?.id, {
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
                return response(res, 404, {
                    success: false,
                    message: "Tài khoản không tồn tại!",
                })
            }

            // Lấy ra tất cả các permissions của tài khoản
            const permissionSlugs = findAccount.roles.flatMap(role =>
                role.permissions.map(permission => permission.slug)
            );
            const uniquePermissionSlugs = [...new Set(permissionSlugs)];

            const accountData = {
                id: findAccount.id,
                full_name: findAccount.full_name,
                first_name: findAccount.first_name,
                last_name: findAccount.last_name,
                email: findAccount.email,
                status: findAccount.status,
                permissions: uniquePermissionSlugs
            }

            // Tạo lại token
            const accessToken = create_token(accountData);
            const refreshToken = create_token({ id: accountData.id }, "7d");

            return response(res, 200, {
                success: true,
                message: "Đã cấp lại token thành công!",
                data: {
                    accessToken,
                    refreshToken,
                    decoded: accountData
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server"
            });
        }
    }
}