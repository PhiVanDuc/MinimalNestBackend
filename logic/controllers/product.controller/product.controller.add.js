const { Product, Variant, ProductImage, ProductType, Inventory, sequelize } = require("../../../db/models/index");

const slugify = require("slugify");
const response = require("../../../utils/response");
const safeParse = require("../../../utils/safe_parse");
const validateNumber = require("../../../utils/validate_number");
const uploadToCloudinary = require("../../../utils/cloudinary_upload");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { product, desc, costPrice, interestRate, discount, discountType, discountAmount, categoryId, livingSpaceIds, sizeIds, colorIds, variants, images } = req.body || {};
        const files = req.files;

        const livingSpaces = safeParse(livingSpaceIds);
        const sizes = safeParse(sizeIds);
        const colors = safeParse(colorIds);
        const variantsData = safeParse(variants);

        // Kiểm tra dữ liệu
        if (
            (
                !product ||
                !desc ||
                !costPrice ||
                !interestRate ||
                !categoryId ||
                !livingSpaces ||
                !livingSpaces?.length ||
                !sizes ||
                !sizes?.length ||
                !colors ||
                !colors?.length ||
                !variantsData ||
                !variantsData?.length  ||
                !images?.length
            )
        ) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        if (
            !validateNumber(costPrice) ||
            !validateNumber(interestRate)
        ) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Dữ liệu số sai định dạng!"
            });
        }

        // Kiểm tra xem slug đã tồn tại chưa
        const slug = slugify(product, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

        const findProduct = await Product.findOne({
            where: { slug }
        });

        if (findProduct) {
            await transaction.rollback();
            return response(res, 400, {
                    success: false,
                    message: "Tên sản phẩm đã tồn tại!"
                }
            );
        }

        // Ghép images với file lại.
        const newImages = images?.map((image, index) => {
            return {
                ...image,
                file: files[index]
            }
        });

        const uniqueColorIds = [...new Set(newImages.map(img => img.colorId))];
        if (uniqueColorIds?.length !== colors?.length) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Một trong các màu sắc của sản phẩm chưa có ảnh!"
            })
        }

        // Thêm sản phẩm
        const discountFields = {};
        if (discount && validateNumber(discountAmount, 0)) {
            discountFields.discount_type = discountType;
            discountFields.discount_amount = parseFloat(discountAmount);
        }

        const addProduct = await Product.create(
            {
                category_id: categoryId,
                slug,
                product: product,
                desc,
                cost_price: parseFloat(costPrice),
                interest_rate: parseFloat(interestRate),
                ...discountFields
            },
            { transaction }
        );

        await addProduct.addLiving_spaces(livingSpaces, { transaction });

        const addVariants = await Variant.bulkCreate(
            variantsData.map(variant => ({
                product_id: addProduct.id,
                color_id: variant.colorId,
                size_id: variant.sizeId,
                sku: variant.sku
            })),
            { transaction }
        );

        // Thêm ảnh
        try {
            const uploadPromises = newImages.map(image => {
                return (
                    uploadToCloudinary(image?.file?.buffer, {
                        folder: "products",
                        quality: 85
                    })
                    .then(uploadResult => ({
                        product_id: addProduct.id,
                        color_id: image?.colorId,
                        url: uploadResult.secure_url,
                        public_id: uploadResult.public_id,
                        display_order: image?.main === "true"
                    }))
                )
            });

            const imageRecords = await Promise.all(uploadPromises);
            await ProductImage.bulkCreate(imageRecords, { transaction });
        } catch (error) {
            await transaction.rollback();
            console.error('Lỗi upload cloudinary:', error);

            return response(res, 500, {
                success: false,
                message: "Lỗi lưu ảnh sản phẩm!"
            });
        }

        const newProductId = await ProductType.findOne(
            { where: { slug: "moi-nhat" } },
            { transaction }
        );

        await addProduct.addProduct_types(
            [newProductId?.id],
            { transaction }
        );

        // Tạo luôn sản phẩm trong kho hàng
        await Inventory.bulkCreate(
            addVariants?.map(variant => {
                return {
                    variant_id: variant?.id,
                    total_quantity: 0,
                    reserved_quantity: 0
                }
            }),
            { transaction }
        )
        
        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Thêm mới sản phẩm thành công!"
        });
    }
    catch(error) {
        await transaction.rollback();
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        })
    }
}