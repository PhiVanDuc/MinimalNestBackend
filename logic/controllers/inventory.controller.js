require("dotenv").config();

const { Inventory, Variant, Product, ProductImage, Color, Size, Category, sequelize } = require("../../db/models/index");
const { Op } = require("sequelize");

const xlsx = require("xlsx");
const response = require("../../utils/response");

const LIMIT = process.env.LIMIT;

module.exports = {
    analysis_inventory: async (req, res) => {
        try {
            const all = await Inventory.findAll({
                attributes: ['total_quantity']
            });

            const quantities = all.map(item => item.get({ plain: true })?.total_quantity || 0);
            const totalItems = quantities.length;

            const { manyInStock, inStock, lowStock } = quantities.reduce(
                (acc, num) => ({
                    manyInStock: acc.manyInStock + (num >= 50 ? 1 : 0),
                    inStock: acc.inStock + (num >= 16 && num <= 49 ? 1 : 0),
                    lowStock: acc.lowStock + (num <= 15 ? 1 : 0)
                }), 
                { manyInStock: 0, inStock: 0, lowStock: 0 }
            );

            const calculatePercentage = (count) => 
                totalItems > 0 ? ((count / totalItems) * 100).toFixed(2) : 0;

            return response(res, 200, {
                success: true,
                message: "Phân tích kho hàng thành công!",
                data: {
                    counts: {
                        manyInStock,
                        inStock,
                        lowStock
                    },
                    percentages: {
                        manyInStock: calculatePercentage(manyInStock),
                        inStock: calculatePercentage(inStock),
                        lowStock: calculatePercentage(lowStock)
                    },
                    totalItems
                }
            });
        }
        catch(error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    },
    get_inventories: async (req, res) => {
        try {
            const page = req.query?.page || 1;
            const product = (req.query?.product)?.trim() || "";

            const limit = +LIMIT;
            const offset = (page - 1) * LIMIT;

            const { count, rows } = await Inventory.findAndCountAll({
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true,
                attributes: ['id', 'total_quantity', 'reserved_quantity', 'created_at'],
                include: [
                    {
                        model: Variant,
                        as: 'variant',
                        required: true,
                        attributes: ['id', 'sku'],
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                required: true,
                                where: product ? { product: { [Op.iLike]: `%${product}%` } } : {},
                                attributes: ['id', 'slug', 'product', 'cost_price', 'category_id'],
                                include: [
                                    {
                                        model: Category,
                                        as: 'category',
                                        attributes: ['id', 'slug', 'category'],
                                        required: false
                                    },
                                    {
                                        model: ProductImage,
                                        as: "product_images",
                                        attributes: ['url'],
                                        where: {
                                            display_order: true
                                        },
                                        required: false
                                    },
                                ]
                            },
                            {
                                model: Color,
                                as: 'color',
                                required: true, // Đảm bảo variant phải có color
                                attributes: ['id', 'slug', 'color', 'code']
                            },
                            {
                                model: Size,
                                as: 'size',
                                required: true, // Đảm bảo variant phải có size
                                attributes: ['id', 'size', 'desc']
                            }
                        ]
                    }
                ],
            });

            const formatRows = rows.map(row => {
                const plainData = row.get({ plain: true });
                
                // Xử lý product_images thành image
                if (plainData.variant?.product?.product_images?.length > 0) {
                    plainData.variant.product.image = plainData.variant.product.product_images[0].url;
                    delete plainData.variant.product.product_images;
                }
                
                return plainData;
            });

            return response(res, 200, {
                success: true,
                message: "Lấy danh sách vai trò thành công!",
                data: {
                    totalItems: count,
                    pageSize: limit,
                    totalPages: Math.ceil(count / limit),
                    currentPage: +page,
                    rows: formatRows
                }
            });
        }
        catch(error) {
            console.log(error);
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    },
    edit_inventory: async (req, res) => {
        try {
            const inventoryId = req.params?.inventoryId;
            const { total_quantity } = req.body;

            if (!inventoryId || !total_quantity) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            if (isNaN(Number(total_quantity))) {
                return response(res, 400, {
                    success: false,
                    message: "Số lượng không hợp lệ!"
                });
            }

            const findInventory = await Inventory.findByPk(inventoryId);
            if (!findInventory) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy sản phẩm trong kho hàng!"
                })
            }

            await findInventory.update({
                total_quantity: +total_quantity
            })

            return response(res, 200, {
                success: true,
                message: "Đã cập nhật số lượng sản phẩm thành công!"
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            })
        }
    },
    add_inventories_excel: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const file = req.files?.[0];
            if (!file) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Không có file nào được upload!"
                });
            }

            const workbook = xlsx.read(file.buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            if (data?.length === 0) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: "Dữ liệu rỗng"
                });
            }

            const formatData = data.map(item => ({
                product_name: item["Tên sản phẩm"]?.toString().trim(),
                sku: item["Mã SKU"]?.toString().trim(),
                quantity: Number(item["Số lượng"])
            }));

            const errors = [];
            const successUpdates = [];

            for (const item of formatData) {
                if (!item.sku || !item.product_name) {
                    errors.push({
                        identifier: `${item.product_name || 'N/A'} (${item.sku || 'N/A'})`,
                        error: !item.sku ? "SKU không được để trống" : "Tên sản phẩm không được để trống"
                    });
                    continue;
                }

                if (isNaN(item.quantity)) {
                    errors.push({
                        identifier: `${item.product_name} (${item.sku})`,
                        error: "Số lượng phải là giá trị số"
                    });
                    continue;
                }
            }

            if (errors.length > 0) {
                await transaction.rollback();
                return response(res, 400, {
                    success: false,
                    message: `${errors.length} dòng dữ liệu không hợp lệ`,
                    errors
                });
            }

            for (const item of formatData) {
                try {
                    const variant = await Variant.findOne({
                        where: {
                            sku: item.sku,
                            '$product.product$': item.product_name
                        },
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'product']
                            },
                            {
                                model: Inventory,
                                as: 'inventory',
                                attributes: ['id', 'total_quantity', 'version']
                            }
                        ],
                        transaction
                    });

                    if (!variant) {
                        throw new Error(`Không tìm thấy sản phẩm với SKU "${item.sku}" và tên "${item.product_name}"`);
                    }

                    if (!variant.inventory) {
                        throw new Error(`Không tìm thấy tồn kho cho sản phẩm`);
                    }

                    const [affectedRows] = await Inventory.update({
                        total_quantity: sequelize.literal(`total_quantity + ${item.quantity}`),
                        version: sequelize.literal(`version + 1`)
                    }, {
                        where: {
                            id: variant.inventory.id,
                            version: variant.inventory.version
                        },
                        transaction
                    });

                    if (affectedRows === 0) {
                        throw new Error("Dữ liệu đã bị thay đổi bởi quá trình khác, vui lòng thử lại");
                    }

                    successUpdates.push({
                        product_id: variant.product.id,
                        product_name: variant.product.product,
                        sku: variant.sku,
                        added_quantity: item.quantity,
                        new_quantity: variant.inventory.total_quantity + item.quantity,
                        version: variant.inventory.version + 1
                    });

                } catch (error) {
                    errors.push({
                        identifier: `${item.product_name} (${item.sku})`,
                        error: error.message
                    });
                }
            }

            if (errors.length > 0) {
                if (errors.length === formatData.length) {
                    await transaction.rollback();
                    return response(res, 400, {
                        success: false,
                        message: "Không thể cập nhật bất kỳ sản phẩm nào",
                        errors
                    });
                }

                await transaction.commit();
                return response(res, 200, {
                    success: true,
                    message: `Cập nhật thành công ${successUpdates.length}/${formatData.length} sản phẩm`,
                    updated_items: successUpdates,
                    errors,
                    error_count: errors.length
                });
            }

            await transaction.commit();
            return response(res, 200, {
                success: true,
                message: `Cập nhật thành công ${successUpdates.length} sản phẩm`,
                data: successUpdates
            });

        }
        catch (error) {
            console.error('Lỗi hệ thống:', error);
            await transaction.rollback();
            return response(res, 500, {
                success: false,
                message: "Lỗi hệ thống: " + error.message
            });
        }
    }
}