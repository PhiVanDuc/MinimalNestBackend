const { Product, Variant, ProductImage, sequelize } = require("../../../db/models/index");
const { Op } = require('sequelize');

const slugify = require("slugify");
const cloudinary = require("../../../utils/cloudinary");
const response = require("../../../utils/response");
const uploadToCloudinary = require("../../../utils/cloudinary_upload");

const validateNumber = (value, min = 0) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
};

const safeParse = (str) => {
    try { return JSON.parse(str) }
    catch { return null }
};

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const reqSlug = req.params?.slug;
        let { product, desc, costPrice, interestRate, discount, discountType, discountAmount, finalPrice, categoryId, livingSpaceIds, sizeIds, colorIds, variants, images, deletedImages, mainImages } = req.body || {};
        const files = req.files;

        livingSpaceIds = safeParse(livingSpaceIds);
        sizeIds = safeParse(sizeIds);
        colorIds = safeParse(colorIds);
        variants = safeParse(variants);
        deletedImages = safeParse(deletedImages);

        // Kiểm tra dữ liệu
        if (
            (
                !reqSlug ||
                !product ||
                !desc ||
                !costPrice ||
                !interestRate ||
                !finalPrice ||
                !categoryId ||
                !livingSpaceIds ||
                !livingSpaceIds?.length ||
                !sizeIds ||
                !sizeIds?.length ||
                !colorIds ||
                !colorIds?.length ||
                !variants ||
                !variants?.length
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
            !validateNumber(interestRate) ||
            !validateNumber(finalPrice)
        ) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Dữ liệu số sai định dạng!"
            });
        }

        // Kiểm tra xem slug có bị trùng với các sản phẩm khác không
        const slug = slugify(product, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

        const currentProduct = await Product.findOne({
            where: { slug: reqSlug },
            transaction
        });

        if (currentProduct.name !== product) {
            const slugConflict = await Product.findOne({
                where: {
                    id: { [Op.ne]: currentProduct.id },
                    slug,
                },
                transaction
            });

            if (slugConflict) {
                await transaction.rollback();
                return response(res, 400, { 
                    success: false, 
                    message: "Tên sản phẩm đã tồn tại!" 
                });
            }
        }

        // Cập nhật sản phẩm
        const discountFields = {};
        if (discount && validateNumber(discountAmount, 0)) {
            console.log("Có vào đây!");

            discountFields.discount_type = discountType;
            discountFields.discount_amount = parseFloat(discountAmount);
        }

        await currentProduct.update(
            {
                category_id: categoryId,
                slug,
                product: product,
                desc,
                cost_price: parseFloat(costPrice),
                interest_rate: parseFloat(interestRate),
                ...discountFields,
                final_price: parseFloat(finalPrice),
            },
            { transaction }
        );

        // Cập nhật lại bảng trung gian giữa products và living spaces
        await currentProduct.setLiving_spaces(livingSpaceIds, { transaction });

        // Cập nhật lại variants
        const currentVariant = await Variant.findAll({
            where: { product_id: currentProduct?.id },
            transaction
        });    

        const currentVariantMap = new Map();
        currentVariant.forEach(variant => {
            const key = `${variant?.size_id}_${variant?.color_id}`;
            currentVariantMap.set(key, variant);
        });

        const variantsToCreate = [];
        const variantsToUpdate = [];
        const variantsToDelete = new Set(currentVariant.map(variant => variant?.id));

        variants.forEach(variant => {
            const key = `${variant?.sizeId}_${variant?.colorId}`;
            const existingVariant = currentVariantMap.get(key);

            if (existingVariant) {
                variantsToUpdate.push({
                    id: existingVariant.id,
                    sku: variant.sku,
                });
                variantsToDelete.delete(existingVariant.id);
            }
            else {
                variantsToCreate.push({
                    product_id: currentProduct.id,
                    size_id: variant.sizeId,
                    color_id: variant.colorId,
                    sku: variant.sku
                });
            }
        });

        await Promise.all([
            variantsToDelete.size > 0 && Variant.destroy({
                where: { id: { [Op.in]: [...variantsToDelete] } },
                transaction
            }),

            variantsToCreate.length > 0 &&
            Variant.bulkCreate(variantsToCreate, { transaction }),

            ...variantsToUpdate.map(variant => 
                Variant.update(
                    variant,
                    {
                        where: { id: variant.id },
                        transaction
                    }
                )
            )
        ]);

        // Cập nhật ảnh
        if (images) {
            // Case 1: Ghép file vào images => newImages
            const newImages = [...images];
            files.forEach(file => {
                const parts = file?.fieldname.split(/[\[\]]/).filter(part => part !== '');

                const prefix = parts[0];
                const index = parts[1];
                
                if (parts && prefix === "images") newImages[index].file = file;
            });

            const uniqueColorIds = [...new Set(newImages.map(img => img.colorId))];
            if (uniqueColorIds?.length !== colorIds?.length) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Một trong các màu sắc của sản phẩm chưa có ảnh!"
                })
            }

            // Case 2: Ghép file vào mainImages => newMainImages
            const newMainImages = [...mainImages];
            files.forEach(file => {
                const parts = file?.fieldname.split(/[\[\]]/).filter(part => part !== '');

                const prefix = parts[0];
                const index = parts[1];
                
                if (parts && prefix === "mainImages") newMainImages[index].file = file;
            });

            // Case 3: Thêm những ảnh mới
            const createImages = newImages?.filter(image => image?.file);

            if (createImages?.length > 0) {
                try {
                    const uploadPromises = createImages.map(image => {
                        return (
                            uploadToCloudinary(image?.file?.buffer, {
                                folder: "products",
                                quality: 85
                            })
                            .then(uploadResult => ({
                                product_id: currentProduct.id,
                                color_id: image?.colorId,
                                url: uploadResult.secure_url,
                                public_id: uploadResult.public_id,
                                display_order: image?.main === "true"
                            }))
                        )
                    });

                    const imageRecords = await Promise.all(uploadPromises);
                    await ProductImage.bulkCreate(imageRecords, { transaction });
                }
                catch(error) {
                    await transaction.rollback();
                    console.error('Lỗi upload cloudinary:', error);

                    return response(res, 500, {
                        success: false,
                        message: "Lỗi lưu ảnh sản phẩm!"
                    });
                }
            }

            // Case 4: Điều chỉnh lại ảnh chính
            const currentMainImages = await ProductImage.findAll({
                where: {
                    product_id: currentProduct?.id,
                    display_order: true
                }
            });

            const currentMainImageMap = new Map();
            currentMainImages.forEach(img => {
                currentMainImageMap.set(img.color_id, img);
            });

            const updateToNormalImages = [];
            const updateToMainImages = [];

            for (const newMainImage of newMainImages) {
                const compareMainImage = currentMainImageMap.get(newMainImage?.colorId);
                
                if (
                    compareMainImage &&
                    (newMainImage?.rootId !== compareMainImage?.id || newMainImage?.file)
                ) {
                    updateToNormalImages.push(compareMainImage?.id);
                    if (newMainImage?.rootId) updateToMainImages.push(newMainImage?.rootId);
                }
            }

            await Promise.all([
                updateToNormalImages.length > 0 && ProductImage.update(
                    { display_order: false },
                    {
                        where: { id: { [Op.in]: updateToNormalImages } },
                        transaction
                    }
                ),
                
                updateToMainImages.length > 0 && ProductImage.update(
                    { display_order: true },
                    {
                        where: { id: { [Op.in]: updateToMainImages } },
                        transaction
                    }
                )
            ]);

            // Case 5: Xóa những ảnh có trong deletedImages
            if (deletedImages?.length > 0) {
                const imagesToDelete = await ProductImage.findAll({
                    where: {
                        id: { [Op.in]: deletedImages },
                        product_id: currentProduct.id
                    },
                    transaction
                });

                // Xóa ảnh từ Cloudinary và database
                await Promise.all([
                    ...imagesToDelete.map(image => 
                        cloudinary.uploader.destroy(image.public_id)
                        .catch(error => console.error("Lỗi khi xóa ảnh từ Cloudinary:", error))
                    ),
                    
                    ProductImage.destroy({
                        where: {
                            id: { [Op.in]: deletedImages },
                            product_id: currentProduct.id
                        },
                        transaction
                    })
                ]);
            }
        }

        await transaction.commit();

        return response(res, 200, {
            success: true,
            message: "Chỉnh sửa sản phẩm thành công!",
            data: {
                product: currentProduct
            }
        });
    }
    catch(error) {
        console.log(error);
        await transaction.rollback();
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        })
    }
}