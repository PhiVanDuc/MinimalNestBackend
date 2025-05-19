const { Role, Permission, Account, Sequelize, sequelize } = require("../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../utils/response");

module.exports = {
    get_roles: async (req, res) => {
        try {
            const page = req.query?.page || 1;
            const role = (req.query?.role)?.trim() || "";

            // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
            const limit = 15;
            const offset = (+page - 1) * limit;

            const whereCondition = role ?
            {
                role: {
                    [Op.iLike]: `%${role}%`
                }
            } :
            {};

            const { count, rows } = await Role.findAndCountAll({
                limit,
                offset,
                where: whereCondition,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Account,
                        as: 'accounts',
                        attributes: [],
                        through: { attributes: [] }
                    }
                ],
                attributes: {
                    include: [
                        [
                            Sequelize.fn("COUNT", Sequelize.col("accounts.id")),
                            "account_used"
                        ]
                    ]
                },
                group: ['Role.id'],
                distinct: true,
                subQuery: false
            });

            return response(res, 200, {
                success: true,
                message: "Lấy danh sách vai trò thành công!",
                data: {
                    totalItems: count?.length,
                    pageSize: limit,
                    totalPages: Math.ceil(count?.length / limit),
                    currentPage: +page,
                    rows
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
    },

    get_role: async (req, res) => {
        try {
            const slug = req.params.slug;

            // Kiểm tra dữ liệu
            if (!slug) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Tìm vai trò
            const findRole = await Role.findOne({
                where: { slug },
                include: {
                    model: Permission,
                    as: 'permissions',
                    attributes: ['slug'],
                    through: { attributes: [] }
                }
            });

            if (!findRole) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy vai trò!"
                });
            }

            // Format lại dữ liệu
            const role = findRole.toJSON();
            role.permissions = role.permissions.map(p => p.slug);

            return response(res, 200, {
                success: true,
                message: "Lấy vai trò thành công!",
                data: {
                    role
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
    },

    add_role: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { roleName, roleDesc, rolePermissions } = req.body || {};

            // Kiểm tra dữ liệu
            if (!roleName || !roleDesc || !rolePermissions || rolePermissions?.length === 0) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Kiểm tra xem role đã tồn tại chưa
            const slug = slugify(roleName, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            const findRole = await Role.findOne({
                where: { slug }
            });

            if (findRole) {
                return response(res, 400, {
                        success: false,
                        message: "Tên vai trò đã tồn tại!"
                    }
                );
            }

            // Tìm kiếm tất cả id của permission
            const findAdmin = await Permission.findOne({
                where: { slug: "admin" },
                attributes: ["id"],
                raw: true
            });

            const findPermissions = await Permission.findAll({
                where: { slug: rolePermissions },
                attributes: ["id"],
                raw: true,
            });

            const permissionIds = [
                findAdmin?.id,
                ...findPermissions.map((p) => p.id)
            ];

            // Thêm mới role
            const addRole = await Role.create({
                slug,
                role: roleName,
                desc: roleDesc
            }, { transaction });

            await addRole.addPermissions(permissionIds, { transaction });
            await transaction.commit();

            return response(res, 200, {
                    success: true,
                    message: "Thêm mới vai trò thành công!",
                    data: {
                        role: addRole
                    }
                }
            );
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

    edit_role: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const paramSlug = req.params.slug;
            const { roleName, roleDesc, rolePermissions } = req.body || {};

            // Kiểm tra dữ liệu
            if (!roleName || !roleDesc || !rolePermissions || rolePermissions?.length === 0 || !paramSlug) {
                return response(res, 400, {
                        success: false,
                        message: "Vui lòng cung cấp đủ dữ liệu!"
                    }
                );
            }

            // Kiểm tra xem có tìm thấy role hiện tại không
            const existingRole = await Role.findOne({
                where: { slug: paramSlug }
            });

            if (!existingRole) {
                return response(res, 400, {
                    success: false,
                    message: "Không thể cập nhật một vai trò không tồn tại!"
                });
            }

            // Kiểm tra xem role đã tồn tại chưa
            const slug = slugify(roleName, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            const findRole = await Role.findOne({
                where: { slug }
            });

            if (findRole && (findRole.id !== existingRole.id)) {
                return response(res, 400, {
                    success: false,
                    message: "Tên vai trò đã tồn tại!"
                });
            }

            // Tìm kiếm tất cả id của permission
            const findAdmin = await Permission.findOne({
                where: { slug: "admin" },
                attributes: ["id"],
                raw: true
            });

            const findPermissions = await Permission.findAll({
                where: { slug: rolePermissions },
                attributes: ["id"],
                raw: true,
            });

            const permissionIds = [
                findAdmin?.id,
                ...findPermissions.map((p) => p.id)
            ];

            // Cập nhật role
            await existingRole.update({
                slug,
                role: roleName,
                desc: roleDesc
            }, { transaction });
            await existingRole.setPermissions(permissionIds, { transaction });
            await transaction.commit();
            
            return response(res, 200, {
                success: true,
                message: "Chỉnh sửa vai trò thành công!",
                data: {
                    role: existingRole
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

    delete_role: async (req, res) => {
        try {
            const slug = req.params.slug;

            // Kiểm tra dữ liệu
            if (!slug) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            await Role.destroy({
                where: { slug }
            });

            return response(res, 200, {
                success: true,
                message: "Xóa vai trò thành công!"
            });
        }
        catch (error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    search_role: async (req, res) => {
        try {
            const { page, role } = req.body || {};

            const pageNumber = parseInt(page, 10);
            const trimmedRole = role?.trim();

            // Kiểm tra dữ liệu đầu vào
            if (!trimmedRole || isNaN(pageNumber) || pageNumber < 1) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu - hợp lệ!"
                });
            }

            // Tìm kiếm
            const limit = 15;
            const offset = (pageNumber - 1) * limit;

            const { count, rows } = await Role.findAndCountAll({
                limit,
                offset,
                where: {
                    role: {
                        [Op.iLike]: `%${trimmedRole}%`
                    }
                },
                order: [['created_at', 'DESC']]
            });

            return response(res, 200, {
                success: true,
                message: "Tìm kiếm vai trò thành công!",
                data: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: pageNumber,
                    rows
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