const { Product, Discount, LivingSpace, ProductType, sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../../utils/response");
const validateNumber = require("../../../utils/validate_number");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
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

        // Kiểm tra dữ liệu đầu vào
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
                (!discountName || !discountType || !discountAmount || !hasAtLeastOneFilter)
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

        const slug = slugify(discountName, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

        const findDiscount = await Discount.findOne({ where: { slug } });

        if (findDiscount) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Tên giảm giá chung đã tồn tại!"
            });
        }

        const addDiscount = await Discount.create({
            slug,
            apply_all: !!applyAll,
            discount_name: discountName,
            discount_type: discountType,
            discount_amount: parseFloat(discountAmount)
        }, { transaction });

        if (!applyAll) {
            if (productTypeIds?.length > 0) {
                await addDiscount.setProduct_types(productTypeIds, { transaction });
            }

            if (categoryIds?.length > 0) {
                await addDiscount.addCategories(categoryIds, { transaction });
            }

            if (livingSpaceIds?.length > 0) {
                await addDiscount.addLiving_spaces(livingSpaceIds, { transaction });
            }
        }

        // Lấy danh sách sản phẩm cần cập nhật discount
        let productIdsToUpdate = productIds;

        if (!productIdsToUpdate || productIdsToUpdate.length === 0) {
            if (applyAll) {
                const allProducts = await Product.findAll({
                    attributes: ['id']
                });
                productIdsToUpdate = allProducts.map(p => p.id);
            } else {
                const orConditions = [];

                if (categoryIds?.length > 0) {
                    orConditions.push({ category_id: { [Op.in]: categoryIds } });
                }

                if (livingSpaceIds?.length > 0) {
                    orConditions.push({ '$living_spaces.id$': { [Op.in]: livingSpaceIds } });
                }

                if (productTypeIds?.length > 0) {
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
        }

        // Cập nhật discount_id cho các sản phẩm được lọc
        if (productIdsToUpdate.length > 0) {
            await Product.update(
                { general_discount_id: addDiscount.id },
                {
                    where: {
                        id: { [Op.in]: productIdsToUpdate }
                    },
                    transaction
                }
            );
        }

        await transaction.commit();

        return response(res, 200, {
            success: true,
            message: "Thêm mới giảm giá chung thành công!",
            data: {
                general_discount: addDiscount
            }
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
