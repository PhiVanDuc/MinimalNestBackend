const { Product, Variant, ProductImage, ProductType, Category, LivingSpace, Color, Size, Inventory, sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const xlsx = require("xlsx");
const slugify = require("slugify");
const response = require("../../../utils/response");
const generate_sku_product = require("../../../utils/generate-sku-product");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const file = req.files?.[0];

        if (!file) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Không có file nào được upload!"
            });
        }

        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = xlsx.utils.sheet_to_json(worksheet);
        
        if (data?.length === 0) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Dữ liệu rỗng"
            });
        }

        function useSlugify(str = "") {
            return slugify(str, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });
        }

        function parseImages(imageStr = "") {
            return imageStr
                .split(' || ')
                .map(item => {
                    const isMain = item.includes('---main');
                    const url = isMain ? item.replace('---main', '') : item;
                    return {
                        main: isMain,
                        url: url.trim()
                    }
                }
            );
        }

        function getPublicIdFromUrl(url = "") {
            const match = url.match(/\/products\/([^\.\/]+)\.[a-z]+$/i);
            return match ? `products/${match[1]}` : null;
        }

        function transformItem(item) {
            return {
                product: item?.['Tên sản phẩm'] || null,
                desc: item?.['Mô tả'] || null,
                cost_price: parseFloat(item?.['Giá gốc']) || 0,
                interest_rate: parseFloat(item?.['Lãi xuất %']) || 0,
                discount_type: item?.['Loại giảm giá'] ?
                (
                    item?.['Loại giảm giá'] === "Giá cố định" ?
                    "amount" : "fixed"
                ) : null,
                discount_amount: item?.['Giảm giá'] | null,
                category: useSlugify(item?.['Danh mục']) || null,
                living_spaces: (item?.['Không gian sống'] || "")
                    ?.split(', ')
                    ?.map(s => useSlugify(s || "")) || null,
                sizes: (item?.['Kích cỡ'] || "")
                    ?.split(', ')
                    ?.map(s => s?.trim()) || null,
                colors: (item?.['Màu sắc'] || "")
                    ?.split(', ')
                    ?.map(s => useSlugify(s)) || null,
                product_images: parseImages(item?.['Hình ảnh']) || null
            };
        }

        function transformData(data) {
            return data.map(transformItem);
        }

        const formattedData = transformData(data);
        const validProducts = [];
        const invalidProducts = [];

        for(const value of formattedData) {
            let invalidMessages = [];

            let categoryId = null;
            let infoColor = null;
            let sizes = [];
            let livingSpaceIds = [];

            if (!value?.product || !value?.desc || !value?.cost_price || !value?.interest_rate || !value?.category || !value?.living_spaces || !value?.sizes || !value?.colors || !value?.product_images) {
                invalidMessages.push("Thiếu dữ liệu cho sản phẩm!");
            }

            for(const item in value) {
                if (item === "product" && value?.[item]) {
                    const findProduct = await Product.findOne({
                        where: {
                            slug: useSlugify(value?.[item])
                        }
                    });

                    if (findProduct) invalidMessages.push("Tên sản phẩm không hợp lệ!");
                }

                // Kiểm tra xem danh mục có tổn tại không
                if (item === "category") {
                    const findCategory = await Category.findOne({
                        where: { slug: value?.[item] }
                    });

                    if (!findCategory) invalidMessages.push("Danh mục không hợp lệ!");
                    else {
                        categoryId = findCategory.id;

                        // Kiểm tra xem kích cỡ có tồn tại không
                        const findSizes = await Size.findAll({
                            where: {
                                category_id: findCategory?.id,
                                size: value?.["sizes"]
                            }
                        });
                        const plainSizes = findSizes.map(s => s.get({ plain: true }));

                        if (plainSizes?.length !== value?.["sizes"]?.length) invalidMessages.push("Kích cỡ không hợp lệ!");
                        else sizes = plainSizes;
                    }
                }

                // Kiểm tra xem có tồn tại living_spaces không
                if (item === "living_spaces") {
                    const findLivingSpaces = await LivingSpace.findAll({
                        where: {
                            slug: {
                                [Op.in]: value?.[item] || []
                            }
                        }
                    });

                    if (findLivingSpaces?.length !== value?.[item]?.length) invalidMessages.push("Không gian sống không hợp lệ!");
                    else livingSpaceIds = findLivingSpaces.map(l => l.id);
                }

                // Kiểm tra có tồn tại màu sắc không
                if (item === "colors") {
                    const findColor = await Color.findOne({
                        where: {
                            slug: value?.[item]
                        }
                    });

                    if (!findColor) invalidMessages.push("Màu sắc không hợp lệ!");
                    else infoColor = findColor.get({ plain: true });
                }
            }

            if (invalidMessages?.length > 0) {
                invalidProducts.push({
                    ...value,
                    invalid_messages: invalidMessages
                });
            }
            else {
                validProducts.push({
                    slug: useSlugify(value?.product),
                    product: value?.product,
                    desc: value?.desc,
                    cost_price: value?.cost_price,
                    interest_rate: value?.interest_rate,
                    discount_type: value?.discount_type || null,
                    discount_amount: value?.discount_amount || null,
                    category_id: categoryId,
                    living_space_ids: livingSpaceIds,
                    sizes: sizes,
                    color: infoColor,
                    product_images: value?.product_images?.map(image => (
                        {
                            color_id: infoColor?.id,
                            url: image.url,
                            display_order: image.main,
                            public_id: getPublicIdFromUrl(image.url)
                        }
                    ))
                });
            }
        }

        if (validProducts?.length > 0) {
            const mergedProductsMap = new Map();

            for (const product of validProducts) {
                const slug = product?.slug;

                if (!mergedProductsMap.has(slug)) {
                    const { color, ...rest } = product;

                    mergedProductsMap.set(slug, {
                        ...rest,
                        colors: [color],
                        product_images: [...product?.product_images]
                    });
                }
                else {
                    const existing = mergedProductsMap.get(slug);

                    const isDuplicateColor = existing.colors.some(c => c?.id === product.color?.id);
                    if (!isDuplicateColor) {
                        existing.colors.push(product.color);
                    }

                    existing.product_images.push(...product.product_images);
                }
            }

            const mergedProducts = Array.from(mergedProductsMap.values());
            const productsWithVariants = mergedProducts.map(product => {
                const variants = [];

                for (const color of product.colors) {
                    for (const size of product.sizes) {
                    const sku = `${generate_sku_product(product?.product, size, color)}`;
                        variants.push({
                            color_id: color.id,
                            size_id: size.id,
                            sku
                        });
                    }
                }

                return {
                    ...product,
                    variants,
                };
            });

            if (productsWithVariants?.length > 0) {
                await Promise.all(
                    productsWithVariants.map(async product => {
                        const createdProduct = await Product.create({
                            category_id: product.category_id,
                            slug: product?.slug,
                            product: product?.product,
                            desc: product?.desc,
                            cost_price: product?.cost_price,
                            interest_rate: product?.interest_rate,
                            discount_type: product?.discount_type || null,
                            discount_amount: product?.discount_amount  || null
                        }, { transaction });

                        const productTypeId = await ProductType.findOne({
                            where: { slug: "moi-nhat" }
                        });
                        await createdProduct.addProduct_types([productTypeId?.id], { transaction })

                        await createdProduct.addLiving_spaces(product?.living_space_ids || [], { transaction });

                        const createdVariants = await Variant.bulkCreate(
                            product?.variants.map(variant => ({
                                product_id: createdProduct.id,
                                color_id: variant.color_id,
                                size_id: variant.size_id,
                                sku: variant.sku
                            })),
                            { transaction }
                        );

                        await ProductImage.bulkCreate(
                            product?.product_images?.map(image => ({ ...image, product_id: createdProduct?.id })) || [],
                            { transaction }
                        );

                        await Inventory.bulkCreate(
                            createdVariants?.map(variant => {
                                return {
                                    variant_id: variant?.id,
                                    total_quantity: 0,
                                    reserved_quantity: 0
                                }
                            }),
                            { transaction }
                        )
                    })
                )
            }
        }

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Đã thêm các sản phẩm thành công!"
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