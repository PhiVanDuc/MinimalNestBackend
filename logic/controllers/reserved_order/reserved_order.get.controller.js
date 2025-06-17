const { ReservedOrder, ReservedOrderItem, Product, ProductImage, Variant, Color, Size, Discount, Event, Coupon } = require("../../../db/models/index");

const response = require("../../../utils/response");

module.exports = async (req, res) => {
    try {
        const reservedOrderId = req.params?.reservedOrderId

        if (!reservedOrderId) {
            return response(res, 400, {
                success: false,
                message: "Vui lòng cung cấp đủ dữ liệu!"
            });
        }

        // Lấy ra các sản phẩm
        const existingReservedOrder = await ReservedOrder.findByPk(reservedOrderId, {
            attributes: ["id", "expired_at", "is_paid"],
            include: [
                {
                    model: ReservedOrderItem,
                    as: "reserved_order_items",
                    attributes: ["id", "quantity"],
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "slug", "product", "cost_price", "interest_rate", "discount_type", "discount_amount"],
                            include: [
                                {
                                    model: ProductImage,
                                    as: "product_images",
                                    attributes: ["id", "url", "color_id"],
                                    where: {
                                        display_order: true
                                    },
                                    required: false
                                },
                                {
                                    model: Discount,
                                    as: "general_discount",
                                    attributes: ["id", "discount_type", "discount_amount"]
                                }
                            ]
                        },
                        {
                            model: Variant,
                            as: "variant",
                            attributes: ["id"],
                            include: [
                                {
                                    model: Color,
                                    as: "color",
                                    attributes: ["id", "slug", "color", "code"]
                                },
                                {
                                    model: Size,
                                    as: "size",
                                    attributes: ["id", "size", "desc"]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!existingReservedOrder) {
            return response(res, 401, {
                success: false,
                message: "Đơn hàng tạm thời không tồn tại!"
            });
        }

        const formatReservedOrderItems = existingReservedOrder?.reserved_order_items?.map(item => {
            const productImages = item?.product?.product_images || [];
            const colorId = item?.variant?.color?.id;

            const matchedImage = productImages.find(img => img.color_id === colorId);

            return {
                id: item?.id,
                quantity: item?.quantity,
                product: item?.product,
                variant_id: item?.variant?.id,
                color: item?.variant?.color,
                size: item?.variant?.size,
                image: matchedImage || null,
            }
        });

        const formattedReservedOrder = {
            ...existingReservedOrder.get({ plain: true }),
            reserved_order_items: formatReservedOrderItems
        };

        // Tính toán tổng tiền đơn hàng
        const calcDiscountPrice = (price, type, amount) => {
            if (type === "amount") return price - amount;
            if (type === "percent") return price - (price * (amount / 100));
            return price;
        }

        let totalOrder = 0;
        let totalQuantity = 0;
        formattedReservedOrder?.reserved_order_items?.forEach(item => {
            const costPrice = parseFloat(item.product.cost_price);
            const interestRate = parseFloat(item.product.interest_rate);
            const normalPrice = costPrice + (costPrice * (interestRate / 100));

            let finalUnitPrice = normalPrice;

            const generalDiscount = item.product.general_discount;
            const productDiscountType = item.product.discount_type;
            const productDiscountAmount = parseFloat(item.product.discount_amount || 0);

            if (generalDiscount) {
                finalUnitPrice = calcDiscountPrice(normalPrice, generalDiscount.discount_type, parseFloat(generalDiscount.discount_amount));
            } else if (productDiscountType && productDiscountAmount > 0) {
                finalUnitPrice = calcDiscountPrice(normalPrice, productDiscountType, productDiscountAmount);
            }

            finalUnitPrice = Math.max(0, finalUnitPrice);
            const lineTotal = finalUnitPrice * item.quantity;

            totalQuantity += item.quantity;
            totalOrder += lineTotal;
        });
        totalOrder = +totalOrder.toFixed(2); 

        // Lấy ra các phiếu giảm giá
        const now = new Date();
        const coupons = await Coupon.findAll({
            attributes: [
                "id", "code", "desc", "discount_type", "discount_price", "quantity",
                "min_order_total", "min_items", "event_id"
            ],
            include: [
                {
                    model: Event,
                    as: "event",
                    attributes: ["id", "event", "image", "link", "start_date", "end_date"]
                }
            ]
        });

        const validCoupons = coupons.filter(coupon => {
            const {
                quantity,
                min_order_total,
                min_items,
                event
            } = coupon;

            const isQuantityValid = quantity > 0;

            const isWithinEventTime =
                event &&
                new Date(event.start_date) <= now &&
                new Date(event.end_date) >= now;

            const isMinOrderValid =
                min_order_total === null || totalOrder >= parseFloat(min_order_total);

            const isMinItemsValid =
                min_items === null || totalQuantity >= parseInt(min_items);

            return isQuantityValid && isWithinEventTime && isMinOrderValid && isMinItemsValid;
        });

        return response(res, 200, {
            success: true,
            message: "Đã lấy ra thông tin đơn hàng tạm thời!",
            data: {
                reserved_order: formattedReservedOrder,
                totalOrder,
                coupons: validCoupons
            }
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