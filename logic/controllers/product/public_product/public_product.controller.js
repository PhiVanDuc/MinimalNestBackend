require("dotenv").config();
const { Product, ProductImage, ProductType, Category, Variant, Color, Size, Discount, Inventory } = require("../../../../db/models/index");
const { Op } = require("sequelize");

const response = require("../../../../utils/response");
const LIMIT = process.env.LIMIT;

module.exports = {
    // Lấy theo product type
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
    // Không lấy theo product type
    get_all_public_products: async (req, res) => {
    try {
        const { limit = LIMIT, page = 1, discount, type, categories, colors } = req.query;
        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);

        // Validate input
        if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0) {
            return response(res, 400, {
                success: false,
                message: "Số lượng sản phẩm muốn lấy hoặc trang hiện tại phải là số nguyên dương!"
            });
        }

        const offset = (parsedPage - 1) * parsedLimit;

        // Build filter conditions
        const filterConditions = [];
        const includeOptions = [
            {
                model: ProductType,
                as: "product_types",
                attributes: ['id', 'slug', 'product_type'],
                through: { attributes: [] },
                required: false
            },
            {
                model: Variant,
                as: "variants",
                attributes: ['id'],
                required: false,
                include: [
                    {
                        model: Color,
                        as: "color",
                        attributes: ['id', 'slug', 'color', 'code'],
                        required: false
                    }
                ]
            },
            {
                model: Discount,
                as: "general_discount",
                attributes: ['id', 'slug', 'discount_name', 'discount_type', 'discount_amount'],
                required: false
            },
            {
                model: ProductImage,
                as: "product_images",
                where: { display_order: true },
                required: false,
                attributes: ['url']
            }
        ];

        // 1. Discount filter
        if (discount === 'true') {
            filterConditions.push({
                [Op.or]: [
                    { general_discount_id: { [Op.ne]: null } },
                    { discount_amount: { [Op.ne]: null } }
                ]
            });
        }

        // 2. Product type filter
        if (type) {
            includeOptions[0].required = true; // product_types
            filterConditions.push({
                '$product_types.slug$': type
            });
        }

        // 3. Categories filter
        if (categories) {
            const categorySlugs = categories.split(',');
            includeOptions.push({
                model: Category,
                as: "category",
                attributes: [],
                required: true // Bắt buộc phải có category
            });
            filterConditions.push({
                '$category.slug$': { [Op.in]: categorySlugs }
            });
        }

        // 4. Colors filter
        if (colors) {
            const colorSlugs = colors.split(',');
            includeOptions[1].required = true; // variants
            includeOptions[1].include[0].required = true; // color
            filterConditions.push({
                '$variants.color.slug$': { [Op.in]: colorSlugs }
            });
        }

        // Build final query options
        const queryOptions = {
            where: filterConditions.length > 0 ? { [Op.or]: filterConditions } : {},
            limit: parsedLimit,
            offset,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'slug', 'product', 'cost_price', 'interest_rate', 
                       'discount_type', 'discount_amount', 'created_at'],
            distinct: true,
            subQuery: false, // Important for complex joins
            include: includeOptions
        };

        // Get total count
        const count = await Product.count({
            where: queryOptions.where,
            include: queryOptions.include,
            distinct: true
        });

        // Get products
        const rows = await Product.findAll(queryOptions);

        // Process results
        const productsWithColors = rows.map(product => {
            const productData = product.toJSON();
            const seenColorIds = new Set();
            const uniqueColors = [];

            // Extract unique colors
            productData.variants?.forEach(variant => {
                if (variant.color && !seenColorIds.has(variant.color.id)) {
                    seenColorIds.add(variant.color.id);
                    uniqueColors.push(variant.color);
                }
            });

            // Format response
            return {
                ...productData,
                colors: uniqueColors,
                image: productData.product_images?.[0]?.url,
                variants: undefined,
                product_images: undefined
            };
        });

        return response(res, 200, {
            success: true,
            message: "Lấy danh sách sản phẩm thành công!",
            data: {
                totalItems: count,
                pageSize: parsedLimit,
                totalPages: Math.ceil(count / parsedLimit),
                currentPage: parsedPage,
                rows: productsWithColors
            }
        });
    } catch(error) {
        console.error('Error fetching products:', error);
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
                attributes: ['id', 'slug', 'product', "desc", 'cost_price', 'interest_rate', 'discount_type', 'discount_amount', 'created_at'],
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