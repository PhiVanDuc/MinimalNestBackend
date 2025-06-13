const { Discount, Product, ProductType, Category, LivingSpace } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const getAll = await Discount.findAll({
            include: [
                {
                    model: ProductType,
                    as: "product_types",
                    attributes: ["id"],
                    through: { attributes: [] }
                },
                {
                    model: Category,
                    as: "categories",
                    attributes: ["id"],
                    through: { attributes: [] }
                },
                {
                    model: LivingSpace,
                    as: "living_spaces",
                    attributes: ["id"],
                    through: { attributes: [] }
                },
                {
                    model: Product,
                    as: "products",
                    attributes: ["id"],
                    where: {
                        general_discount_id: { [require("sequelize").Op.ne]: null }
                    },
                    required: false
                }
            ]
        });

        const finalData = getAll?.map(item => {
            const data = item.toJSON();
            const { product_types, categories, living_spaces } = data;
            let productTypeIds, categoryIds, livingSpaceIds;

            if (product_types) productTypeIds = product_types?.map(pt => pt?.id);
            if (categories) categoryIds = categories?.map(c => c?.id);
            if (living_spaces) livingSpaceIds = living_spaces?.map(ls => ls?.id);
            
            const result = {
                rootId: data?.id,
                discountName: data?.discount_name,
                applyAll: data?.apply_all,
                discountType: data?.discount_type,
                discountAmount: data?.discount_amount,
                productTypeIds,
                categoryIds,
                livingSpaceIds,
                productIds: data?.products
            }

            return result;
        })
        
        return response(res, 200, {
            success: true,
            message: "Lấy ra thành công danh sách giảm giá chung!",
            data: {
                general_discounts: finalData
            }
        })
    }
    catch(error) {
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        })
    }
}