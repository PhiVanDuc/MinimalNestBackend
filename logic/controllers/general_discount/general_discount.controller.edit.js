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

        // Kiểm tra dữ liệu đầu vào
        if (!discountName || !discountType || !discountAmount) {
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
                message: "Số tiền giảm giá không hợp lệ!"
            });
        }

        const foundDiscount = await Discount.findByPk(generalDiscountId);
        if (!foundDiscount) {
            await transaction.rollback();
            return response(res, 404, {
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
                    message: "Tên giảm giá chung đã tồn tại!"
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

        // Xác định danh sách sản phẩm cần cập nhật
        let productIdsToUpdate = productIds;

        if (!productIdsToUpdate || productIdsToUpdate.length === 0) {
            if (applyAll) {
                // Nếu applyAll là true, lấy tất cả sản phẩm
                const allProducts = await Product.findAll({ attributes: ['id'] });
                productIdsToUpdate = allProducts.map(p => p.id);
            } else {
                // Nếu không applyAll thì lọc theo điều kiện
                const whereConditions = [];

                if (categoryIds?.length > 0) {
                    whereConditions.push({ category_id: { [Op.in]: categoryIds } });
                }

                if (livingSpaceIds?.length > 0) {
                    whereConditions.push({ '$living_spaces.id$': { [Op.in]: livingSpaceIds } });
                }

                if (productTypeIds?.length > 0) {
                    whereConditions.push({ '$product_types.id$': { [Op.in]: productTypeIds } });
                }

                if (whereConditions.length > 0) {
                    const filteredProducts = await Product.findAll({
                        where: {
                            [Op.or]: whereConditions
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
        }

        // Lấy danh sách sản phẩm hiện tại có discount này
        const currentProducts = await foundDiscount.getProducts({ transaction });
        const currentProductIds = currentProducts.map(p => p.id);

        // Xác định sản phẩm cần thêm và xóa
        const idsToAdd = productIdsToUpdate.filter(id => !currentProductIds.includes(id));
        const idsToRemove = currentProductIds.filter(id => !productIdsToUpdate.includes(id));

        // Cập nhật discount cho sản phẩm mới
        if (idsToAdd.length > 0) {
            await Product.update(
                { general_discount_id: foundDiscount.id },
                {
                    where: { id: { [Op.in]: idsToAdd } },
                    transaction
                }
            );
        }

        // Xóa discount khỏi sản phẩm không còn áp dụng
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
            message: "Cập nhật giảm giá chung thành công!",
            data: {
                discount: foundDiscount
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}