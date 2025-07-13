const { sequelize, Product, ProductType, OrderItem, Order } = require("../../db/models/index");
const { Op, literal } = require("sequelize");

const cron = require("node-cron");
cron.schedule("*/1 * * * *", async () => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Trạng thái 'moi-nhat'
        const latestType = await ProductType.findOne({
            where: { slug: "moi-nhat" },
            transaction
        });

        if (latestType) {
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

            if (products.length) {
                for (const product of products) {
                    await product.removeProduct_type(latestType, { transaction });
                }
                console.log(`[✓] Đã gỡ loại sản phẩm mới nhất khỏi ${products.length} sản phẩm!`);
            }
        }

        // 2. Trạng thái 'ban-chay-nhat'
        const bestSellerType = await ProductType.findOne({
            where: { slug: "ban-chay-nhat" },
            transaction
        });

        if (!bestSellerType) {
            await transaction.commit();
            console.warn("Không tìm thấy loại sản phẩm bán chạy nhất!");
            return;
        }

        // Làm sạch các sản phẩm có trạng thái 'ban-chay-nhat'
        const currentBestSellers = await bestSellerType.getProducts({ transaction });
        if (currentBestSellers.length > 0) {
            await bestSellerType.removeProducts(currentBestSellers, { transaction });
            console.log(`[✓] Đã xóa ${currentBestSellers.length} sản phẩm khỏi danh sách bán chạy nhất cũ`);
        }

        // Tìm 10 sản phẩm bán chạy nhất (số lượng bán >= 50)
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [literal('SUM(quantity)'), 'total_sold']
            ],
            include: [{
                association: "order",
                where: {
                    status: 'fulfilled'
                },
                attributes: []
            }],
            group: ['product_id'],
            having: literal('SUM(quantity) >= 50'),
            order: [[literal('total_sold'), 'DESC']],
            limit: 10,
            transaction
        });

        // Thêm loại "bán chạy nhất" vào các sản phẩm top
        const productIds = topProducts.map(item => item.product_id);

        const validProductIds = productIds.filter(id => id !== null);
        if (validProductIds.length === 0) {
            console.log("[✓] Không có sản phẩm hợp lệ để cập nhật.");
            await transaction.commit();
            return;
        }
        
        const productsToUpdate = await Product.findAll({
            where: {
                id: productIds
            },
            transaction
        });

        for (const product of productsToUpdate) {
            await product.addProduct_type(bestSellerType, { transaction });
        }

        console.log(`[✓] Đã cập nhật ${productsToUpdate.length} sản phẩm bán chạy nhất!`);
        await transaction.commit();
    }
    catch(error) {
        await transaction.rollback();
        console.error("Lỗi khi kiểm tra loại sản phẩm: ", error);
    }
});