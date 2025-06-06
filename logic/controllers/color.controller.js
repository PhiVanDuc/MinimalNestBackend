require("dotenv").config();
const { Color } = require("../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    get_colors: async (req, res) => {
        try {
            const all = req.query?.all;
            const page = req.query?.page || 1;
            const color = (req.query?.color)?.trim() || "";

            if (!all) {
                // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
                const limit = +LIMIT;
                const offset = (+page - 1) * limit;

                const whereCondition = color ?
                {
                    color: {
                        [Op.iLike]: `%${color}%`
                    }
                } :
                {};

                const { count, rows } = await Color.findAndCountAll({
                    limit,
                    offset,
                    where: whereCondition,
                    order: [['created_at', 'DESC']]
                });

                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách màu sắc thành công!",
                    data: {
                        totalItems: count,
                        pageSize: limit,
                        totalPages: Math.ceil(count / limit),
                        currentPage: +page,
                        rows
                    }
                });
            }
            else {
                const allColors = await Color.findAll();
                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách màu sắc thành công!",
                    data: {
                        colors: allColors
                    }
                })
            }
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    get_color: async (req, res) => {
        try {
            const colorId = req.params?.colorId;

            // Kiểm tra dữ liệu
            if (!colorId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Tìm kiếm màu sắc
            const findColor = await Color.findByPk(colorId);
            if (!findColor) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể chỉnh sửa màu sắc không tồn tại!"
                })
            }

            return response(res, 200, {
                success: true,
                message: "Lấy màu sắc sắc thành công!",
                data: {
                    color: findColor
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

    add_color: async (req, res) => {
        try {
            const { color, code } = req.body;

            // Kiểm tra dữ liệu
            if (!color || !code) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            const slug = slugify(color, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            const addColor = await Color.create({
                slug,
                color,
                code
            });

            return response(res, 200, {
                success: true,
                message: "Thêm mới màu sắc thành công!",
                data: {
                    color: addColor
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    },

    edit_color: async (req, res) => {
        try {
            const colorId = req.params?.colorId;
            const { color, code } = req.body;

            // Kiểm tra dữ liệu
            if (!colorId || !color || !code) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Tìm kiếm màu sắc
            const findColor = await Color.findByPk(colorId);
            if (!findColor) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể chỉnh sửa màu sắc không tồn tại!"
                })
            }

            const slug = slugify(color, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            // Cập nhật màu sắc
            const updateColor = await findColor.update({
                slug,
                color,
                code
            });

            return response(res, 200, {
                success: true,
                message: "Chỉnh sửa màu sắc thành công!",
                data: {
                    color: updateColor
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    },

    delete_color: async (req, res) => {
        try {
            const colorId = req.params?.colorId;

            // Kiểm tra dữ liệu
            if (!colorId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Xóa màu sắc
            await Color.destroy({
                where: { id: colorId }
            });

            return response(res, 200, {
                success: true,
                message: "Xóa màu sắc thành công!"
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: (error.name === 'SequelizeForeignKeyConstraintError' || error.parent?.code === 'ER_ROW_IS_REFERENCED_2') ?
                "Đang có sản phẩm sử dụng, không thể xóa màu sắc này!" :
                "Lỗi server!"
            })
        }
    }
}