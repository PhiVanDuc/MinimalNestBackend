const { Inventory, ReservedOrder, ReservedOrderItem, sequelize } = require("../../../db/models/index");
const response = require("../../../utils/response");

module.exports = async (req, res) => {
    const transaction = await sequelize.transaction();
    const MAX_RETRIES = 5;

    try {
        const { accountId, products } = req.body || {};

        // Kiểm tra dữ liệu
        if (!accountId || !Array.isArray(products) || products?.length === 0) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        // Chuẩn hóa dữ liệu
        const items = products.map(p => ({
            product_id: p?.product?.id,
            variant_id: p?.variant?.id,
            quantity: p?.quantity,
            product_name: p?.product?.product
        }));

        // Kiểm tra tồn kho 
        const variantIds = items.map(i => i.variant_id);
        const allInv = await Inventory.findAll({
            where: { variant_id: variantIds },
            transaction,
        });

        const outOfStock = [];
        for (const it of items) {
            const inv = allInv.find(i => i.variant_id === it.variant_id);

            if (!inv || inv.total_quantity - inv.reserved_quantity < it.quantity) {
                outOfStock.push(it.product_name);
            }
        }

        if (outOfStock.length) {
            await transaction.rollback();
            return response(res, 400, {
                success: false,
                message: `Sản phẩm ${outOfStock.join(", ")} không còn đủ hàng!`,
                data: { out_of_stock_products: outOfStock },
            });
        }

        // Giữ chỗ cho đơn hàng tạm thời + optimistic locking + retry
        for (const it of items) {
            let attempt = 0;
            let reserved = false;

            while (attempt < MAX_RETRIES && !reserved) {
                attempt++;

                const inv = await Inventory.findOne({
                    where: { variant_id: it?.variant_id },
                    transaction
                });

                if (!inv) {
                    await transaction.rollback();
                    return response(res, 404, {
                        success: false,
                        message: `Không tìm thấy tồn kho cho ${it?.product_name}!`
                    });
                }

                if (inv.total_quantity - inv.reserved_quantity < it.quantity) {
                    await transaction.rollback();
                    return response(res, 400, {
                        success: false,
                        message: `Sản phẩm ${it?.product_name} không còn đủ hàng!`,
                    });
                }

                inv.reserved_quantity += it.quantity;
                try {
                    await inv.save({ transaction });
                    reserved = true;
                }
                catch(error) {
                    if (error instanceof OptimisticLockError) {
                        // Lỗi do xung đột version (conflict version)
                        // Sau 1 khoảng thời gian thì retry
                        await new Promise(r => setTimeout(r, 50 * attempt));
                    }
                    else {
                        await transaction.rollback();
                        return response(res, 500, {
                            success: false,
                            message: "Lỗi khi cập nhật tồn kho, vui lòng thử lại!",
                        });
                    }
                }
            }

            if (!reserved) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Lỗi tạo đơn tạm thời, vui lòng thử lại sau!",
                })
            }
        }

        // Tạo reserved order
        const reservedOrder = await ReservedOrder.create(
            { account_id: accountId },
            { transaction }
        );

        const itemsData = items.map(it => ({
            reserved_order_id: reservedOrder.id,
            product_id: it.product_id,
            variant_id: it.variant_id,
            quantity: it.quantity,
        }));

        await ReservedOrderItem.bulkCreate(itemsData, { transaction });

        await transaction.commit();
        return response(res, 200, {
            success: true,
            message: "Đã tạo đơn hàng tạm thành công!",
            data: {
                reserved_order_id: reservedOrder?.id
            }
        })
    }
    catch(error) {
        await transaction.rollback();
        console.log(error);
        
        return response(res, 500, {
            success: false,
            message: "Lỗi server!"
        });
    }
}