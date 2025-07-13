require("dotenv").config();
const { Product, ProductImage, LivingSpace, ProductType, Category, Variant, Color, Size, Discount, Inventory } = require("../../../../db/models/index");
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
            const { limit = 20, page = 1, discount, type, categories, colors } = req.query;
            const livingSpace = req.query?.['living-space'];
            const parsedLimit = parseInt(limit);
            const parsedPage = parseInt(page);

            if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tham số phân trang không hợp lệ'
                });
            }

            const offset = (parsedPage - 1) * parsedLimit;
            const options = {
                attributes: ['id', 'slug', 'product', 'cost_price', 'interest_rate', 'discount_type', 'discount_amount'],
                include: [
                    {
                        model: ProductImage,
                        as: 'product_images',
                        where: { display_order: true },
                        attributes: ['url'],
                        required: false
                    },
                    {
                        model: Discount,
                        as: "general_discount",
                        attributes: ['id', 'slug', 'discount_name', 'discount_type', 'discount_amount']
                    },
                ],
                where: {},
                distinct: true,
                subQuery: false
            };

            // Tạo mảng chứa các điều kiện OR
            const orConditions = [];

            // Xử lý điều kiện không gian sống
            if (livingSpace) {
                options.include.push({
                    model: LivingSpace,
                    as: "living_spaces",
                    where: { slug: livingSpace },
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                });
                orConditions.push({
                    '$living_spaces.slug$': livingSpace
                });
            }

            // Xử lý điều kiện giảm giá
            if (discount === 'true') {
                orConditions.push({
                    [Op.or]: [
                        { general_discount_id: { [Op.ne]: null } },
                        { discount_amount: { [Op.ne]: null } }
                    ]
                });
            }

            // Xử lý điều kiện loại sản phẩm (slug)
            if (type) {
                const typeSlugs = type.split(',').map(t => t.trim());
                options.include.push({
                    model: ProductType,
                    as: 'product_types',
                    where: { slug: typeSlugs },
                    through: { attributes: [] },
                    attributes: [],
                    required: false
                });
                orConditions.push({
                    '$product_types.slug$': { [Op.in]: typeSlugs }
                });
            }

            // Xử lý điều kiện danh mục (slug)
            if (categories) {
                const categorySlugs = categories.split(',').map(c => c.trim());
                options.include.push({
                    model: Category,
                    as: 'category',
                    where: { slug: categorySlugs },
                    attributes: [],
                    required: false
                });
                orConditions.push({
                    '$category.slug$': { [Op.in]: categorySlugs }
                });
            }

            // Xử lý điều kiện màu sắc (slug)
            if (colors) {
                const colorSlugs = colors.split(',').map(c => c.trim());
                options.include.push({
                    model: Variant,
                    as: 'variants',
                    attributes: [],
                    include: [{
                        model: Color,
                        as: 'color',
                        where: { slug: colorSlugs },
                        attributes: []
                    }],
                    required: false
                });
                orConditions.push({
                    '$variants.color.slug$': { [Op.in]: colorSlugs }
                });
            }

            // Áp dụng điều kiện OR nếu có
            if (orConditions.length > 0) {
                options.where = { [Op.or]: orConditions };
            }

            // Thực hiện query
            const { count, rows } = await Product.findAndCountAll({
                ...options,
                limit: parsedLimit,
                offset: offset,
                order: [['created_at', 'DESC']]
            });

            // Lấy thông tin màu sắc riêng để tránh ảnh hưởng đến phân trang
            const productsWithColors = await Promise.all(
                rows.map(async product => {
                    const variants = await Variant.findAll({
                        where: { product_id: product.id },
                        include: [{
                            model: Color,
                            as: 'color',
                            attributes: ['id', 'slug', 'color', 'code']
                        }]
                    });

                    const uniqueColors = [];
                    const colorMap = new Map();

                    variants.forEach(v => {
                        if (v.color && !colorMap.has(v.color.id)) {
                            colorMap.set(v.color.id, true);
                            uniqueColors.push({
                                id: v.color.id,
                                slug: v.color.slug,
                                color: v.color.color,
                                code: v.color.code
                            });
                        }
                    });

                    return {
                        ...product.get({ plain: true }),
                        colors: uniqueColors,
                        image: product.product_images[0]?.url || null
                    };
                })
            );

            return res.json({
                success: true,
                data: {
                    totalItems: count,
                    pageSize: parsedLimit,
                    totalPages: Math.ceil(count / parsedLimit),
                    currentPage: parsedPage,
                    rows: productsWithColors
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
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