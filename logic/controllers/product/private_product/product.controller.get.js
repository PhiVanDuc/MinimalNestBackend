const { Product, Discount, LivingSpace, Variant, ProductImage, Color, Size } = require("../../../../db/models/index");

const response = require("../../../../utils/response");

module.exports = async (req, res) => {
    try {
        const slug = req.params?.slug;

        if (!slug) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            })
        }

        // Lấy ra 
        const getProduct = await Product.findOne(
            {
                where: { slug },
                include: [
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'discount_name', 'discount_type', 'discount_amount']
                    },
                    {
                        model: LivingSpace,
                        as: "living_spaces",
                        attributes: ['id'],
                        through: { attributes: [] }
                    },
                    {
                        model: Variant,
                        as: "variants",
                        attributes: ["id", "color_id", "size_id"]
                    },
                    {
                        model: ProductImage,
                        as: "product_images",
                        attributes: ["id", "color_id", "url", "display_order"]
                    }
                ]
            }
        );

        if (!getProduct) {
            return response(res, 404, {
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        // Lấy các màu và kích cỡ không trùng lặp từ variants
        const productPlain = getProduct.get({ plain: true });
        const colorIds = [...new Set(getProduct.variants.map(v => v.color_id))];
        const sizeIds = [...new Set(getProduct.variants.map(v => v.size_id))];
        const livingSpaceIds = getProduct.living_spaces.map(ls => ls.id);

        const colors = await Color.findAll({
            where: { id: colorIds },
            attributes: ["id", "slug", "color", "code"]
        });

        const sizes = await Size.findAll({
            where: { id: sizeIds },
            attributes: ["id", "category_id", "size", "desc"]
        });

        const formatImages = productPlain?.product_images?.map(image => {
            return {
                rootId: image?.id,
                colorId: image?.color_id,
                file: image?.url,
                main: image?.display_order
            };
        });

        const { id, slug: finalSlug, product, desc, category_id, cost_price, interest_rate, general_discount, discount_type, discount_amount } = productPlain;

        const data = {
            product: {
                id,
                slug: finalSlug,
                product,
                desc,
                category_id,
                cost_price,
                interest_rate,
                general_discount,
                discount_type,
                discount_amount
            },
            living_space_ids: livingSpaceIds,
            colors: colors.map(c => c.get({ plain: true })),
            sizes: sizes.map(s => s.get({ plain: true })),
            images: formatImages
        };

        return response(res, 200, {
            success: true,
            message: "Lấy ra sản phẩm thành công!",
            data
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