require("dotenv").config();

const { Op } = require("sequelize");
const { Size, Category } = require("../../db/models/index");

const response = require("../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    get_sizes: async (req, res) => {
        try {
            const all = req.query?.all;
            const page = req.query?.page || 1;
            const size = (req.query?.size)?.trim() || "";

            if (!all) {
                const limit = +LIMIT;
                const offset = (+page - 1) * limit;

                const whereCondition = size ?
                {
                    size: {
                        [Op.iLike]: `%${size}%`
                    }
                } :
                {};

                const { count, rows } = await Size.findAndCountAll({
                    limit,
                    offset,
                    where: whereCondition,
                    order: [['created_at', 'DESC']],
                    include: [
                        {
                            model: Category,
                            as: 'category'
                        }
                    ]
                });

                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách kích cỡ thành công!",
                    data: {
                        totalItems: count,
                        pageSize: limit,
                        totalPages: Math.ceil(count / limit),
                        currentPage: +page,
                        rows
                    }
                });
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

    get_size: async (req, res) => {
        try {
            const sizeId = req.params.sizeId;

            // Kiểm tra dữ liệu
            if (!sizeId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Tìm kiếm kích cỡ
            const findSize = await Size.findByPk(sizeId ,{
                include: {
                    model: Category,
                    as: 'category'
                }
            });

            if (!findSize) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy kích cỡ!"
                });
            }

            return response(res, 200, {
                success: true,
                message: "Lấy kích cỡ thành công!",
                data: {
                    size: findSize
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

    add_size: async (req, res) => {
        try {
            const { category, size, desc } = req.body;

            // Kiểm tra dữ liệu
            if (!category || !size || !desc) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            const addSize = await Size.create({
                category_id: category,
                size,
                desc
            });

            return response(res, 200, {
                success: true,
                message: "Thêm mới kích cỡ thành công!",
                data: {
                    size: addSize
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

    edit_size: async (req, res) => {
        try {
            const sizeId = req.params?.sizeId;
            const { category, size, desc } = req.body;

            // Kiểm tra dữ liệu
            if (!sizeId || !category || !size || !desc) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Tìm kiếm kích cỡ
            const findSize = await Size.findByPk(sizeId);

            if (!findSize) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể cập nhật kích cỡ không tồn tại!"
                });
            }

            // Cập nhật
            const updateSize = await findSize.update({
                category_id: category,
                size,
                desc
            });

            return response(res, 200, {
                success: true,
                message: "Chỉnh sửa kích cỡ thành công!",
                data: {
                    size: updateSize
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

    delete_size: async (req, res) => {
        try {
            const sizeId = req.params?.sizeId;

            // Kiểm tra dữ liệu
            if (!sizeId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Tìm kiếm kích cỡ
            const findSize = await Size.findByPk(sizeId);

            if (!findSize) {
                return response(res, 404, {
                    success: false,
                    message: "Không thể xóa kích cỡ không tồn tại!"
                });
            }

            // Xóa
            await findSize.destroy();

            return response(res, 200, {
                success: false,
                message: "Đã xóa thành công kích cỡ!"
            })
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