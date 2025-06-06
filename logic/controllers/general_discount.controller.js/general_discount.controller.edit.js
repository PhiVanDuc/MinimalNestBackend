const { Discount, sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../../utils/response");
const validateNumber = require("../../../utils/validate_number");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const generalDiscountId = req.params?.generalDiscountId;
        const { applyAll, productTypeIds, livingSpaceIds, categoryIds, discountName, discountType, discountAmount, productIds } = req.body || {};

        // Kiểm tra dữ liệu
        if (
            (
                applyAll &&
                (
                    !discountName ||
                    !discountType ||
                    !discountAmount
                )
            ) ||
            (
                !applyAll &&
                (
                    !productTypeIds ||
                    !productTypeIds?.length ||
                    !livingSpaceIds ||
                    !livingSpaceIds?.length ||
                    !categoryIds ||
                    !categoryIds?.length ||
                    !discountName ||
                    !discountType ||
                    !discountAmount
                )
            )
        ) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        if (!validateNumber(discountAmount)) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Sai định dạng số!"
            });
        }

        // Kiểm tra xem có tìm thấy giảm giá chung không
        const foundDiscount = await Discount.findByPk(generalDiscountId);
        if (!foundDiscount) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Không tìm thấy giảm giá chung!"
            });
        }

        // Kiểm tra xem slug đã tồn tại chưa
        const slug = slugify(discountName, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

        // Chỉ kiểm tra nếu slug mới KHÁC slug hiện tại
        if (slug !== foundDiscount.slug) {
            const existingDiscount = await Discount.findOne({
                where: {
                    slug,
                    id: { [Op.ne]: foundDiscount.id }
                }
            });

            if (existingDiscount) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Tên giảm giá chung đã tồn tại, vui lòng chọn tên khác!"
                });
            }
        }

        // Cập nhật giảm giá chung
        await foundDiscount.update({
            slug,
            apply_all: !applyAll ? false : true,
            discount_name: discountName,
            discount_type: discountType,
            discount_amount: parseFloat(discountAmount)
        }, { transaction });

        await foundDiscount.setProduct_types(
            applyAll ? [] : productTypeIds,
            { transaction }
        );

        await foundDiscount.setCategories(
            applyAll ? [] : categoryIds,
            { transaction }
        );
        
        await foundDiscount.setLiving_spaces(
            applyAll ? [] : livingSpaceIds,
            { transaction }
        );

        if (productIds?.length > 0) {
            const currentProducts = await foundDiscount.getProducts({ transaction });
            const currentProductIds = currentProducts.map(p => p.id);
            
            const idsToAdd = productIds.filter(id => !currentProductIds.includes(id));
            const idsToRemove = currentProductIds.filter(id => !productIds.includes(id));
            
            if (idsToAdd.length > 0) {
                await sequelize.models.Product.update(
                    { general_discount_id: foundDiscount.id },
                    {
                        where: { id: { [Op.in]: idsToAdd } },
                        transaction
                    }
                );
            }
            
            if (idsToRemove.length > 0) {
                await sequelize.models.Product.update(
                    { general_discount_id: null },
                    {
                        where: { id: { [Op.in]: idsToRemove } },
                        transaction
                    }
                );
            }
        } else {
            await sequelize.models.Product.update(
                { general_discount_id: null },
                {
                    where: { general_discount_id: foundDiscount.id },
                    transaction
                }
            );
        }

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Chỉnh sửa giảm giá chung thành công!"
        })
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