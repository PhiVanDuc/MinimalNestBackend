const { Cart, CartItem, Product, Discount, ProductImage, Variant, Color, Size, } = require("../../db/models/index");

const response = require("../../utils/response");

module.exports = {
    get_cart: async (req, res) => {
        try {
            const accountId = req.params?.accountId;

            if (!accountId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            const cart = await Cart.findOne({
                where: { account_id: accountId },
                include: [
                    {
                        model: CartItem,
                        as: "cart_items",
                        include: [
                            {
                                model: Product,
                                as: "product",
                                attributes: ["id", "slug", "product", "cost_price", "interest_rate", "discount_type", "discount_amount"],
                                include: {
                                    model: Discount,
                                    as: "general_discount"
                                }
                            },
                            {
                                model: Variant,
                                as: "variant",
                                attributes: ["id", "sku"],
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

            if (cart?.cart_items?.length > 0) {
                for (const item of cart.cart_items) {
                    const image = await ProductImage.findOne({
                        where: {
                            product_id: item.product_id,
                            color_id: item.variant.color.id,
                            display_order: true
                        },
                        attributes: ["id", "url"]
                    });
                    
                    item.product.setDataValue("image", image);
                }
            }

            return response(res, 200, {
                success: true,
                message: "Đã lấy ra giỏ hàng!",
                data: {
                    cart
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
    },

    add_cart: async (req, res) => {
        try {
            const { accountId, productId, variantId, quantity = 1 } = req.body;

            if (!accountId || !productId || !variantId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            const [cart, created] = await Cart.findOrCreate({
                where: { account_id: accountId },
                defaults: {
                    account_id: accountId
                }
            });

            let cartItem = await CartItem.findOne({
                where: {
                    cart_id: cart.id,
                    product_id: productId,
                    variant_id: variantId
                }
            });

            if (cartItem) {
                cartItem = await cartItem.update({
                    quantity: cartItem.quantity + quantity
                });
            } else {
                cartItem = await CartItem.create({
                    cart_id: cart.id,
                    product_id: productId,
                    variant_id: variantId,
                    quantity: quantity
                });
            }

            return response(res, 200, {
                success: true,
                message: "Thêm sản phẩm vào giỏ hàng thành công!",
                data: {
                    cart_item: cartItem
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
    },
    delete_cart_item: async (req, res) => {
        try {
            const cartItemId = req.params?.cartItemId;

            if (!cartItemId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            await CartItem.destroy({
                where: { id: cartItemId }
            });

            return response(res, 200, {
                success: true,
                message: "Xóa sản phẩm trong giỏ hàng thành công!"
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
}