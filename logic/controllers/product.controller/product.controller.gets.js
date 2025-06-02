const { Product, Category, Variant, Size, Color } = require("../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = async (req, res) => {
    try {
        const page = req.query?.page || 1;
        const product = (req.query?.product)?.trim() || "";

        // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
        const limit = +LIMIT;
        const offset = (+page - 1) * limit;

        const whereCondition = product ?
        {
            product: {
                [Op.iLike]: `%${product}%`
            }
        } :
        {};

        const { count, rows } = await Product.findAndCountAll({
            limit,
            offset,
            where: whereCondition,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Category,
                    as: "category"
                },
                {
                    model: Variant,
                    as: "variants",
                    include: [
                        {
                            model: Color,
                            as: "color"
                        },
                        {
                            model: Size,
                            as: "size"
                        }
                    ]
                }
            ]
        });

        // Lọc ra màu sắc và kích cỡ của sản phẩm
        const plainRows = rows.map(row => row.get({ plain: true }));
        const formatRows = plainRows.map(product => {
            const variants = product?.variants;
            const colors = [];
            const sizes = [];

            variants.forEach(variant => {
                if (variant.color) colors.push(variant.color);
                if (variant.size) sizes.push(variant.size);
            });

            const uniqueColors = Object.values(
                colors.reduce((acc, color) => {
                    acc[color.id] = color;
                    return acc;
                }, {})
            );

            const uniqueSizes = Object.values(
                sizes.reduce((acc, size) => {
                    acc[size.id] = size;
                    return acc;
                }, {})
            );

            const newProduct = {
                ...product,
                colors: uniqueColors,
                sizes: uniqueSizes
            };

            delete newProduct?.variants;
            return newProduct;
        });

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách sản phẩm thành công!",
            data: {
                totalItems: count,
                pageSize: limit,
                totalPages: Math.ceil(count?.length / limit),
                currentPage: +page,
                rows: formatRows
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