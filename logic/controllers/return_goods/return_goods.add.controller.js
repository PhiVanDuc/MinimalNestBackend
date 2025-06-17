const { ReturnGoods, ReturnGoodsItem, ProofImage, sequelize } = require("../../../db/models/index");

const response = require("../../../utils/response");
const uploadToCloudinary = require("../../../utils/cloudinary_upload");

function groupFilesByProductId(files) {
  const result = {};

  for (const file of files) {
    const fieldname = file.fieldname;

    const parts = fieldname.split('[');
    if (parts.length < 3) continue;

    const productPart = parts[2];
    const product_id = productPart.replace(']', '');

    if (!result[product_id]) {
        result[product_id] = [];
    }

    result[product_id].push(file);
  }

  return result;
}


module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { return_goods, return_goods_items } = req.body || {};
        const files = req.files;

        if (!return_goods || !return_goods_items) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        const formatReturnGoods = JSON.parse(return_goods);
        const formatReturnGoodsItems = JSON.parse(return_goods_items);
        const formatProofImages = groupFilesByProductId(files);

        // 1. Tạo ReturnGoods
        const createdReturnGoods = await ReturnGoods.create(formatReturnGoods, { transaction });

        // 2. Tạo các ReturnGoodsItem liên kết với ReturnGoods
        const itemsWithReturnId  = formatReturnGoodsItems.map(item => ({
            ...item,
            return_goods_id: createdReturnGoods.id
        }));

        const createdItems = await ReturnGoodsItem.bulkCreate(itemsWithReturnId, { transaction });

        // 3. Upload ảnh + lưu ProofImage bằng bulkCreate
        const proofImagesData = [];

        for (const item of createdItems) {
            const productId = item.product_id;
            const proofFiles = formatProofImages[productId] || [];

            for (const file of proofFiles) {
                const result = await uploadToCloudinary(file.buffer, {
                    folder: "return goods",
                    quality: 85
                });

                proofImagesData.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                    return_goods_item_id: item.id
                });
            }
        }

        if (proofImagesData.length > 0) {
            await ProofImage.bulkCreate(proofImagesData, { transaction });
        }

        await transaction.commit();
        
        return response(res, 200, {
            success: true,
            message: "Đã tạo yêu cầu trả hàng thành công!"
        });
    }
    catch(error) {
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}