const { Product, OrderItem, ProductImage, Discount, Category, Variant, Color, Size, sequelize } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const productTotals = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity']
            ],
            group: ['product_id'],
            having: sequelize.where(sequelize.fn('SUM', sequelize.col('quantity')), '>', 0),
            order: [[sequelize.literal('total_quantity'), 'DESC']],
            limit: 5,
            raw: true
        });

        if (productTotals.length === 0) {
            return response(res, 200, {
                success: true,
                message: "Không có sản phẩm nào được bán",
                data: { products: [] }
            });
        }

        const productIds = productTotals.map(item => item.product_id);
        const products = await Product.findAll({
            where: {
                id: productIds
            },
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
        });

        const productTotalMap = productTotals.reduce((map, item) => {
            map[item.product_id] = item.total_quantity;
            return map;
        }, {});

        // Sắp xếp sản phẩm theo thứ tự giống với productTotals (số lượng bán giảm dần)
        const sortedProducts = products
            .map(product => product.get({ plain: true }))
            .sort((a, b) => productTotalMap[b.id] - productTotalMap[a.id]);

        const formatProducts = sortedProducts.map(plainProduct => {
            const totalSold = productTotalMap[plainProduct.id] || 0;

            // Xử lý variants để lấy colors và sizes
            const variants = plainProduct.variants || [];
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
                id: plainProduct.id,
                slug: plainProduct.slug,
                product: plainProduct.product,
                image: plainProduct.product_images?.[0]?.url,
                category: plainProduct.category,
                cost_price: plainProduct.cost_price,
                interest_rate: plainProduct.interest_rate,
                general_discount: plainProduct.general_discount,
                discount_type: plainProduct.discount_type,
                discount_amount: plainProduct.discount_amount,
                colors: uniqueColors,
                sizes: uniqueSizes,
                total_sold: totalSold
            };
        });

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