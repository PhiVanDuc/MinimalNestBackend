const { Product, OrderItem, ProductImage, Discount, Category, Variant, Color, Size } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const bestSellingProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity']
            ],
            group: ['product_id'],
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: 10,
            include: [
                {
                    model: Product,
                    as: "product",
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
                            attributes: ['id', 'discount_name', 'discount_type', 'discount_amount']
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
                    ]
                }
            ]
        });

        const formatProducts = bestSellingProducts.map(item => {
            const product = item.product?.get({ plain: true });
            if (!product) return null;

            const variants = product?.variants || [];
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

            return {
                id: product?.id,
                slug: product?.slug,
                product: product?.product,
                image: product?.product_images[0]?.url,
                category: product?.category,
                cost_price: product?.cost_price,
                interest_rate: product?.interest_rate,
                general_discount: product?.general_discount,
                discount_type: product?.discount_type,
                discount_amount: product?.discount_amount,
                colors: uniqueColors,
                sizes: uniqueSizes,
                total_sold: item.dataValues.total_quantity
            };
        })
        .filter(Boolean);

        return response(res, 200, {
            success: true,
            message: "Thành công lấy ra các sản phẩm bán chạy nhất!",
            data: {
                products: formatProducts
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