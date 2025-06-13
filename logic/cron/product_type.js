const { sequelize, Product, ProductType } = require("../../db/models/index");
const { Op } = require("sequelize");

const cron = require("node-cron");
cron.schedule("0 0 * * *", async () => {
    const transaction = await sequelize.transaction();

    try {
        const latestType = await ProductType.findOne({
            where: { slug: "moi-nhat" },
            transaction
        });

        if (!latestType) {
            await transaction.commit();
            console.warn("Không tìm thấy loại sản phẩm mới nhất!");
            return;
        }

        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

        const products = await Product.findAll({
            where: {
                created_at: {
                    [Op.lte]: eightDaysAgo
                }
            },
            include: {
                association: "product_types",
                where: {
                    id: latestType.id
                }
            },
            transaction
        });

        if (!products.length) {
            await transaction.commit();
            console.log("[✓] Không có sản phẩm nào cần xoá loại sản phẩm mới nhất!");
            return;
        }

        for (const product of products) {
            await product.removeProduct_type(moiNhatType, { transaction });
        }

        console.log(`[✓] Đã gỡ loại sản phẩm mới nhất khỏi ${products.length} sản phẩm!`);
        await transaction.commit();
    }
    catch(error) {
        await transaction.rollback();
        console.error("Lỗi khi kiểm tra loại sản phẩm: ", error);
    }
});