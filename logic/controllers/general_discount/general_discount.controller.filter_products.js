const { Product, ProductImage, ProductType, LivingSpace, Discount, Category, Variant, Color, Size } = require("../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const { applyAll, productTypeIds, categoryIds, livingSpaceIds } = req.body || {};

        let products = [];

        if (applyAll) {
            products = await Product.findAll({
                include: [
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'discount_name', 'discount_type', 'discount_amount'],
                    },
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
                ],
                order: [['created_at', 'DESC']]
            });
        }
        else {
            const orConditions = [];

            if (categoryIds && categoryIds.length) {
                orConditions.push({ category_id: { [Op.in]: categoryIds } });
            }

            if (livingSpaceIds && livingSpaceIds.length) {
                orConditions.push({ '$living_spaces.id$': { [Op.in]: livingSpaceIds } });
            }

            if (productTypeIds && productTypeIds.length) {
                orConditions.push({ '$product_types.id$': { [Op.in]: productTypeIds } });
            }

            if (orConditions.length === 0) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng chọn bộ lọc để tìm kiếm sản phẩm phù hợp!"
                })
            }

            let whereCondition = { [Op.or]: orConditions };
            products = await Product.findAll({
                where: whereCondition,
                include: [
                    {
                        model: ProductImage,
                        as: "product_images",
                        where: {
                            display_order: true
                        },
                        required: false
                    },
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'discount_name', 'discount_type', 'discount_amount'],
                    },
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
                    },
                    {
                        model: LivingSpace,
                        as: "living_spaces",
                        attributes: [],
                        through: { attributes: [] },
                        required: false
                    },
                    {
                        model: ProductType,
                        as: "product_types",
                        attributes: [],
                        through: { attributes: [] },
                        required: false
                    }
                ],
                distinct: true,
                order: [['created_at', 'DESC']]
            });
        }

        // Lọc ra màu sắc và kích cỡ của sản phẩm
        const plainProducts = products.map(row => row.get({ plain: true }));
        const formatProducts = plainProducts.map(product => {
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
                id: product?.id,
                image: product?.product_images[0]?.url,
                product: product?.product,
                colors: uniqueColors,
                sizes: uniqueSizes,
                general_discount: product?.general_discount,
                cost_price: product?.cost_price,
                interest_rate: product?.interest_rate
            };
            
            return newProduct;
        });

        return response(res, 200, {
            success: true,
            message: "Lọc danh sách sản phẩm thành công!",
            data: {
                products: formatProducts
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
}