const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = require("./auth");
const tokenRouter = require("./token");
const roleRouter = require("./role");
const permissionRouter = require("./permission");
const accountRouter = require("./account");

router.get('/', function(req, res, next) {
  res.json({
    welcome: "RESTful API Minimal Nest"
  })
});
router.use('/auth', authRouter);
router.use('/token', tokenRouter);

// Các đường dẫn api cần bảo vệ
const protectedRouter = express.Router();

// Sử dụng auth middleware
protectedRouter.use(authMiddleware);
protectedRouter.use('/roles', roleRouter);
protectedRouter.use('/permissions', permissionRouter);
protectedRouter.use('/accounts', accountRouter);

// Gắn nhóm protected và router chính
router.use(protectedRouter);

module.exports = router;
