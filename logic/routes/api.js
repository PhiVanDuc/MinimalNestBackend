const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = require("./auth");
const tokenRouter = require("./token");
const roleRouter = require("./role");
const permissionRouter = require("./permission");
const accountRouter = require("./account");
const eventRouter = require("./event");
const couponRouter = require("./coupon");
const colorRouter = require("./color");
const categoryRouter = require("./category");
const sizeRouter = require("./size");
const livingSpaceRouter = require("./living_space");
const generalDiscountRouter = require("./general_discount");
const productRouter = require("./product");
const productTypeRouter = require("./product_type");
const inventoryRouter = require("./inventory");

const publicProductRouter = require("./public_product");

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

// Gắn nhóm protected và router chính
router.use(protectedRouter);

module.exports = router;
