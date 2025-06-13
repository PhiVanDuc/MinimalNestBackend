const { Product, ProductImage, sequelize } = require("../../../../db/models/index");

const cloudinary = require("../../../../utils/cloudinary");
const response = require("../../../../utils/response");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const productId = req.params?.productId;

        if (!productId) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            })
        }

        const product = await Product.findOne({
            where: { id: productId },
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return response(res, 404, {
                success: false,
                message: "Không tìm thấy sản phẩm!"
            });
        }

        const productImages = await ProductImage.findAll({
            where: { product_id: productId }
        });

        await Promise.all(
            productImages.map(img => cloudinary.uploader.destroy(img.public_id))
        );

        await ProductImage.destroy({
            where: { product_id: productId },
            transaction
        })

        await Product.destroy({
            where: { id: productId },
            transaction
        });

        await product.setProduct_types([], { transaction });

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Đã xóa sản phẩm thành công!"
        })
    }
    catch(error) {
        await transaction.rollback();
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: (error.name === 'SequelizeForeignKeyConstraintError' || error.parent?.code === 'ER_ROW_IS_REFERENCED_2') ?
            "Đang tồn tại đơn hàng giữ chỗ, chưa thể xóa sản phẩm." :
            "Lỗi server!"
        })
    }
}