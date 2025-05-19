const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const accountRouter = require("./account");
const tokenRouter = require("./token");
const roleRouter = require("./role");
const permissionRouter = require("./permission");

router.get('/', function(req, res, next) {
  res.json({
    welcome: "RESTful API Minimal Nest"
  })
});
router.use('/auth', accountRouter);
router.use('/token', tokenRouter);

// Các đường dẫn api cần bảo vệ
const protectedRouter = express.Router();

// Sử dụng auth middleware
protectedRouter.use(authMiddleware);
protectedRouter.use('/roles', roleRouter);
protectedRouter.use('/permissions', permissionRouter);

// Gắn nhóm protected và router chính
router.use(protectedRouter);

module.exports = router;
