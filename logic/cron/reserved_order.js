const { sequelize, ReservedOrder, Inventory } = require("../../db/models");
const { Op } = require("sequelize");

const cron = require("node-cron");
cron.schedule('*/5 * * * *', async () => {
    const transaction = await sequelize.transaction();

    try {
        const expiredOrders = await ReservedOrder.findAll({
            where: {
                expired_at: {
                    [Op.lt]: new Date()
                }
            },
            include: ["reserved_order_items"],
            transaction
        });

        if (!expiredOrders.length) {
            await transaction.commit();
            return;
        }

        for (const order of expiredOrders) {
            for (const item of order.reserved_order_items) {
                const inventory = await Inventory.findOne({
                    where: { variant_id: item.variant_id },
                    transaction
                });

                if (!inventory) throw new Error("Không tìm thấy tồn kho của sản phẩm.");

                const quantityToReturn = Math.min(inventory.reserved_quantity, item.quantity);
                await inventory.increment(
                    { reserved_quantity: -quantityToReturn },
                    { transaction }
                );
            }

            await ReservedOrder.destroy({
                where: { id: order.id },
                transaction
            });
        }

        console.log(`[✓] Dọn ${expiredOrders.length} đơn hàng tạm thời đã hết hạn lúc ${new Date().toLocaleString()}`);
        await transaction.commit();
    }
    catch(error) {
        await transaction.rollback();
        console.error("Lỗi khi dọn dẹp đơn hàng tạm thời: ", error);
    }
});