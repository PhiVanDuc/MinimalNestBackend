const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = require("./auth");
const tokenRouter = require("./token");
const categoryRouter = require("./category");
const livingSpaceRouter = require("./living_space");
const productTypeRouter = require("./product_type");
const publicProductRouter = require("./product/public_product");
const publicCouponRouter = require("./coupon/public_coupon");
const publicEventRouter = require("./event/public_event");

const roleRouter = require("./role");
const permissionRouter = require("./permission");
const accountRouter = require("./account");
const eventRouter = require("./event/event");
const couponRouter = require("./coupon/coupon");
const colorRouter = require("./color");
const sizeRouter = require("./size");
const generalDiscountRouter = require("./general_discount");
const productRouter = require("./product/private_product");
const inventoryRouter = require("./inventory");
const cartRouter = require("./cart");
const reservedOrderRouter = require("./reserved_order");
const bookAddressRouter = require("./book_address");
const paymentRouter = require("./payment");

// Các đường dẫn công khai
router.get('/', function(req, res, next) {
  res.json({
    welcome: "RESTful API Minimal Nest"
  })
});
router.use('/auth', authRouter);
router.use('/token', tokenRouter);
router.use('/categories', categoryRouter);
router.use('/living_spaces', livingSpaceRouter);
router.use('/product_types', productTypeRouter);
router.use('/public_products', publicProductRouter);
router.use('/public_coupons', publicCouponRouter);
router.use('/public_events', publicEventRouter);

// Các đường dẫn api cần bảo vệ
const protectedRouter = express.Router();

// Sử dụng auth middleware
protectedRouter.use(authMiddleware);
protectedRouter.use('/roles', roleRouter);
protectedRouter.use('/permissions', permissionRouter);
protectedRouter.use('/accounts', accountRouter);
protectedRouter.use('/events', eventRouter);
protectedRouter.use('/coupons', couponRouter);
protectedRouter.use('/colors', colorRouter);
protectedRouter.use('/sizes', sizeRouter);
protectedRouter.use('/general_discounts', generalDiscountRouter);
protectedRouter.use('/products', productRouter);
protectedRouter.use('/inventories', inventoryRouter);
protectedRouter.use('/carts', cartRouter);
protectedRouter.use('/reserved_orders', reservedOrderRouter);
protectedRouter.use('/book_addresses', bookAddressRouter);
protectedRouter.use('/payment', paymentRouter);

// Sử dụng các đường dẫn cần bảo vệ
router.use(protectedRouter);

module.exports = router;
