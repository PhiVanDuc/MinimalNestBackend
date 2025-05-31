const { Product, Variant, ProductImage, sequelize } = require("../../../db/models/index");

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
        const { product, desc, costPrice, interestRate, discount, discountType, discountAmount, finalPrice, categoryId, livingSpaceIds, sizeIds, colorIds, variants, images } = req.body || {};
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
                !finalPrice ||
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
            !validateNumber(interestRate) ||
            !validateNumber(finalPrice)
        ) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Dữ liệu số sai định dạng!"
            });
        }

        // Ghép images với file lại.
        const newImages = images.map((image, imageIndex) => {
            const colorId = image?.color;
            const imageFiles = [];
            
            const filesMap = {};
            files.forEach(file => {
                const match = file.fieldname.match(/images\[(\d+)\]\[files\]\[(\d+)\]\[file\]/);

                if (match) {
                    const [_, imgIdx, fileIdx] = match;

                    if (!filesMap[imgIdx]) filesMap[imgIdx] = {};
                    filesMap[imgIdx][fileIdx] = file;
                }
            });

            image.files?.forEach((file, fileIndex) => {
                const matchedFile = filesMap[imageIndex]?.[fileIndex];
                if (matchedFile) {
                    imageFiles.push({
                        main: file.main === "true" ? true : false,
                        file: matchedFile
                    });
                }
            });

            return {
                color: colorId,
                files: imageFiles
            };
        });

        const hasEmptyFiles = newImages.some(image => image.files.length === 0);
        if (hasEmptyFiles) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Một trong các màu sắc của sản phẩm chưa có ảnh!"
            });
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
                product: product,
                desc,
                cost_price: parseFloat(costPrice),
                interest_rate: parseFloat(interestRate),
                ...discountFields,
                final_price: parseFloat(finalPrice),
            },
            { transaction }
        );

        await addProduct.addLiving_spaces(livingSpaces, { transaction });

        await Variant.bulkCreate(
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
            const uploadPromises = newImages.flatMap(imageGroup => {
                const colorId = imageGroup?.color;

                return imageGroup.files.map(file => 
                    uploadToCloudinary(file?.file?.buffer, {
                        folder: "products",
                        quality: 85
                    })
                    .then(uploadResult => ({
                        product_id: addProduct.id,
                        color_id: colorId,
                        url: uploadResult.secure_url,
                        public_id: uploadResult.public_id,
                        display_order: file?.main
                    }))
                );
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