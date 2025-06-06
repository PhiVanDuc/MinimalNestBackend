const { Product, Discount, sequelize } = require("../../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../../utils/response");
const validateNumber = require("../../../utils/validate_number");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
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

        // Kiểm tra xem slug đã tồn tại chưa
        const slug = slugify(discountName, {
            lower: true,
            locale: 'vi',
            remove: /[*+~.()'"!:@]/g
        });

        const findDiscount = await Discount.findOne({
            where: { slug }
        });

        if (findDiscount) {
            await transaction.rollback();
            return response(res, 400, {
                    success: false,
                    message: "Tên giảm giá chung đã tồn tài!"
                }
            );
        }

        const addDiscount = await Discount.create(
            {
                slug,
                apply_all: !applyAll ? false : true,
                discount_name: discountName,
                discount_type: discountType,
                discount_amount: parseFloat(discountAmount)
            },
            { transaction }
        );

        if (!applyAll) {
            await addDiscount.setProduct_types(
                productTypeIds,
                { transaction }
            );

            await addDiscount.addCategories(
                categoryIds,
                { transaction }
            );
            
            await addDiscount.addLiving_spaces(
                livingSpaceIds,
                { transaction }
            );
        }

        if (productIds?.length > 0) {
            await Product.update(
                {
                    general_discount_id: addDiscount?.id
                },
                {
                    where: {
                        id: {
                            [Op.in]: productIds
                        }
                    },
                    transaction
                }
            )           
        }

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Thêm mới giảm giá chung thành công!",
            data: {
                general_discount: addDiscount
            }
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