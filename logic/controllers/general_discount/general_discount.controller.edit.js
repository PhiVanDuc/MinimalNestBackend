const { Discount, sequelize, Product, LivingSpace, ProductType } = require("../../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../../utils/response");
const validateNumber = require("../../../utils/validate_number");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const generalDiscountId = req.params?.generalDiscountId;
        const {
            applyAll,
            productTypeIds,
            livingSpaceIds,
            categoryIds,
            discountName,
            discountType,
            discountAmount,
            productIds
        } = req.body || {};

        const hasAtLeastOneFilter =
            (categoryIds?.length || 0) > 0 ||
            (livingSpaceIds?.length || 0) > 0 ||
            (productTypeIds?.length || 0) > 0;

        if (
            (
                applyAll &&
                (!discountName || !discountType || !discountAmount)
            ) ||
            (
                !applyAll &&
                (!hasAtLeastOneFilter || !discountName || !discountType || !discountAmount)
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

        const foundDiscount = await Discount.findByPk(generalDiscountId);
        if (!foundDiscount) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Không tìm thấy giảm giá chung!"
            });
        }

        const slug = slugify(discountName, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

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

        // Cập nhật thông tin chính
        await foundDiscount.update({
            slug,
            apply_all: !!applyAll,
            discount_name: discountName,
            discount_type: discountType,
            discount_amount: parseFloat(discountAmount)
        }, { transaction });

        // Cập nhật các quan hệ N-N
        await foundDiscount.setProduct_types(applyAll ? [] : productTypeIds || [], { transaction });
        await foundDiscount.setCategories(applyAll ? [] : categoryIds || [], { transaction });
        await foundDiscount.setLiving_spaces(applyAll ? [] : livingSpaceIds || [], { transaction });

        // Tự động lọc sản phẩm nếu không truyền productIds
        let productIdsToUpdate = productIds;

        if (!productIdsToUpdate || productIdsToUpdate.length === 0) {
            const orConditions = [];

            if (categoryIds?.length) {
                orConditions.push({ category_id: { [Op.in]: categoryIds } });
            }

            if (livingSpaceIds?.length) {
                orConditions.push({ '$living_spaces.id$': { [Op.in]: livingSpaceIds } });
            }

            if (productTypeIds?.length) {
                orConditions.push({ '$product_types.id$': { [Op.in]: productTypeIds } });
            }

            const filteredProducts = await Product.findAll({
                where: {
                    [Op.or]: orConditions
                },
                include: [
                    {
                        model: LivingSpace,
                        as: "living_spaces",
                        attributes: [],
                        through: { attributes: [] },
                        required: false
                    },
                    {
                        model: ProductType,
                        as: "product_types",
                        attributes: [],
                        through: { attributes: [] },
                        required: false
                    }
                ],
                attributes: ['id']
            });

            productIdsToUpdate = filteredProducts.map(p => p.id);
        }

        // Update lại các product liên quan
        const currentProducts = await foundDiscount.getProducts({ transaction });
        const currentProductIds = currentProducts.map(p => p.id);

        const idsToAdd = productIdsToUpdate.filter(id => !currentProductIds.includes(id));
        const idsToRemove = currentProductIds.filter(id => !productIdsToUpdate.includes(id));

        if (idsToAdd.length > 0) {
            await Product.update(
                { general_discount_id: foundDiscount.id },
                {
                    where: { id: { [Op.in]: idsToAdd } },
                    transaction
                }
            );
        }

        if (idsToRemove.length > 0) {
            await Product.update(
                { general_discount_id: null },
                {
                    where: { id: { [Op.in]: idsToRemove } },
                    transaction
                }
            );
        }

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Chỉnh sửa giảm giá chung thành công!"
        });

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}
