require("dotenv").config();
const { Product, ProductImage, ProductType, Variant, Color, Size, Discount, Inventory } = require("../../db/models/index");

const response = require("../../utils/response");
const LIMIT = process.env.LIMIT;

module.exports = {
    get_public_products: async (req, res) => {
        try {
            const limit = req.query?.limit;
            const productType = req.query?.productType;

            if (limit && (isNaN(limit) || parseInt(limit) <= 0)) {
                return response(res, 400, {
                    success: false,
                    message: "Số lượng sản phẩm muốn lấy phải là số nguyên dương!"
                });
            }

            let productTypeInclude = null;
            if (productType) {
                const findProductType = await ProductType.findOne({
                    where: { slug: productType }
                });

                if (!findProductType) {
                    return response(res, 400, {
                        success: false,
                        message: "Không tìm thấy loại sản phẩm!"
                    })
                }

                productTypeInclude = {
                    model: ProductType,
                    as: "product_types",
                    where: { slug: productType },
                    attributes: ['id', 'slug', 'product_type'],
                    through: { attributes: [] }
                };
            }

            const includeList = [];

            if (productTypeInclude) {
                includeList.push(productTypeInclude);
            }

            // Thêm sản phẩm
            const products = await Product.findAll({
                order: [['created_at', 'DESC']],
                attributes: ['id', 'slug', 'product', 'cost_price', 'interest_rate', 'discount_type', 'discount_amount', 'created_at'],
                limit: limit,
                include: [
                    ...includeList,
                    {
                        model: Variant,
                        as: "variants",
                        attributes: ['id'],
                        include: [
                            {
                                model: Color,
                                as: "color",
                                attributes: ['id', 'slug', 'color', 'code']
                            }
                        ]
                    },
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'slug', 'discount_name', 'discount_type', 'discount_amount']
                    },
                    {
                        model: ProductImage,
                        as: "product_images",
                        where: { display_order: true },
                        attributes: ['url']
                    },
                ]
            });

            const productsWitchColors = products.map(product => {
                const productData = product.toJSON();
                const seenColorIds = new Set();
                const uniqueColors = [];

                productData.variants.forEach(variant => {
                    const color = variant.color;
                    if (color && !seenColorIds.has(color.id)) {
                        seenColorIds.add(color.id);
                        uniqueColors.push(color);
                    }
                });

                productData.colors = uniqueColors;
                productData.image = productData?.product_images[0]?.url;
                delete productData.variants;
                delete productData.product_images;

                return productData;
            })

            return response(res, 200, {
                success: true,
                message: "Lấy ra danh sách sản phẩm mới nhất thành công!",
                data: {
                    products: productsWitchColors
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
    get_all_public_products: async (req, res) => {
        try {
            const limit = req.query?.limit || +LIMIT;
            const page = req.query?.page || 1;

            if ((isNaN(limit) || parseInt(limit) <= 0) || (isNaN(page) || parseInt(page) <= 0)) {
                return response(res, 400, {
                    success: false,
                    message: "Số lượng sản phẩm muốn lấy hoặc trang hiện tại phải là số nguyên dương!"
                });
            }

            const offset = (+page - 1) * limit;

            const count = await Product.count();
            const rows = await Product.findAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                attributes: ['id', 'slug', 'product', 'cost_price', 'interest_rate', 'discount_type', 'discount_amount', 'created_at'],
                limit: limit,
                include: [
                    {
                        model: Variant,
                        as: "variants",
                        attributes: ['id'],
                        include: [
                            {
                                model: Color,
                                as: "color",
                                attributes: ['id', 'slug', 'color', 'code']
                            }
                        ]
                    },
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'slug', 'discount_name', 'discount_type', 'discount_amount']
                    },
                    {
                        model: ProductImage,
                        as: "product_images",
                        where: { display_order: true },
                        attributes: ['url']
                    },
                ]
            });

            const productsWitchColors = rows.map(product => {
                const productData = product.toJSON();
                const seenColorIds = new Set();
                const uniqueColors = [];

                productData.variants.forEach(variant => {
                    const color = variant.color;
                    if (color && !seenColorIds.has(color.id)) {
                        seenColorIds.add(color.id);
                        uniqueColors.push(color);
                    }
                });

                productData.colors = uniqueColors;
                productData.image = productData?.product_images[0]?.url;
                delete productData.variants;
                delete productData.product_images;

                return productData;
            });

            return response(res, 200, {
                success: true,
                message: "Lấy danh sách sản phẩm thành công!",
                data: {
                    totalItems: count,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    currentPage: +page,
                    rows: productsWitchColors
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
    get_public_product: async (req, res) => {
        try {
            const paramSlug = req.params?.slug;

            if (!paramSlug) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp slug sản phẩm!"
                });
            }

            const product = await Product.findOne({
                where: { slug: paramSlug },
                attributes: ['id', 'slug', 'product', 'cost_price', 'interest_rate', 'discount_type', 'discount_amount', 'created_at'],
                include: [
                    {
                        model: ProductImage,
                        as: "product_images",
                        attributes: ['id', 'color_id', 'url', 'display_order']
                    },
                    {
                        model: Discount,
                        as: "general_discount"
                    },
                    {
                        model: Variant,
                        as: "variants",
                        attributes: ['id'],
                        include: [
                            {
                                model: Color,
                                as: "color",
                                attributes: ['id', 'slug', 'color', 'code']
                            },
                            {
                                model: Size,
                                as: "size",
                                attributes: ['id', 'size', 'desc']
                            },
                            {
                                model: Inventory,
                                as: "inventory",
                                attributes: ['total_quantity', 'reserved_quantity']
                            }
                        ]
                    }
                ]
            });

            if (!product) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy sản phẩm!"
                });
            }

            const productData = product.toJSON();

            const seenColorIds = new Set();
            const seenSizeIds = new Set();
            const uniqueColors = [];
            const uniqueSizes = [];

            // Duyệt qua variants để lọc màu, size và giữ lại thông tin tồn kho
            productData.variants = productData.variants.map(variant => {
                const color = variant.color;
                const size = variant.size;

                if (color && !seenColorIds.has(color.id)) {
                    seenColorIds.add(color.id);
                    uniqueColors.push(color);
                }

                if (size && !seenSizeIds.has(size.id)) {
                    seenSizeIds.add(size.id);
                    uniqueSizes.push(size);
                }

                // Thêm trực tiếp total_quantity và reserved_quantity vào từng variant
                return variant;
            });

            // Gán các màu và size đã lọc
            productData.colors = uniqueColors;
            productData.sizes = uniqueSizes;

            return response(res, 200, {
                success: true,
                message: "Đã lấy thành công sản phẩm!",
                data: {
                    product: productData
                }
            });
        } catch (error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    }
}