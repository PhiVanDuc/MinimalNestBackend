'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   return queryInterface.bulkInsert('permissions', [
    {
      id: uuidv4(),
      slug: "admin",
      permission: "Trang quản trị"
    },
    {
      id: uuidv4(),
      slug: "all-dashboard",
      permission: "Tất cả bảng thống kê"
    },
    {
      id: uuidv4(),
      slug: "list-role",
      permission: "Danh sách vai trò"
    },
    {
      id: uuidv4(),
      slug: "add-role",
      permission: "Thêm vai trò"
    },
    {
      id: uuidv4(),
      slug: "edit-role",
      permission: "Chỉnh sửa vai trò"
    },
    {
      id: uuidv4(),
      slug: "delete-role",
      permission: "Xóa vai trò"
    },
    {
      id: uuidv4(),
      slug: "list-account",
      permission: "Danh sách tài khoản"
    },
    {
      id: uuidv4(),
      slug: "edit-account",
      permission: "Chỉnh sửa tài khoản"
    },
    {
      id: uuidv4(),
      slug: "list-event",
      permission: "Danh sách sự kiện"
    },
    {
      id: uuidv4(),
      slug: "add-event",
      permission: "Thêm sự kiện"
    },
    {
      id: uuidv4(),
      slug: "edit-event",
      permission: "Chỉnh sửa sự kiện"
    },
    {
      id: uuidv4(),
      slug: "delete-event",
      permission: "Xóa sự kiện"
    },
    {
      id: uuidv4(),
      slug: "list-coupon",
      permission: "Danh sách phiếu giảm giá"
    },
    {
      id: uuidv4(),
      slug: "add-coupon",
      permission: "Thêm phiếu giảm giá"
    },
    {
      id: uuidv4(),
      slug: "edit-coupon",
      permission: "Chỉnh sửa phiếu giảm giá"
    },
    {
      id: uuidv4(),
      slug: "delete-coupon",
      permission: "Xóa phiếu giảm giá"
    },
    {
      id: uuidv4(),
      slug: "list-color",
      permission: "Danh sách màu sắc"
    },
    {
      id: uuidv4(),
      slug: "add-color",
      permission: "Thêm màu sắc"
    },
    {
      id: uuidv4(),
      slug: "edit-color",
      permission: "Chỉnh sửa màu sắc"
    },
    {
      id: uuidv4(),
      slug: "delete-color",
      permission: "Xóa màu sắc"
    },
    {
      id: uuidv4(),
      slug: "list-size",
      permission: "Danh sách kích cỡ"
    },
    {
      id: uuidv4(),
      slug: "add-size",
      permission: "Thêm kích cỡ"
    },
    {
      id: uuidv4(),
      slug: "edit-size",
      permission: "Chỉnh sửa kích cỡ"
    },
    {
      id: uuidv4(),
      slug: "delete-size",
      permission: "Xóa kích cỡ"
    },
    {
      id: uuidv4(),
      slug: "list-product",
      permission: "Danh sách sản phẩm"
    },
    {
      id: uuidv4(),
      slug: "add-product",
      permission: "Thêm sản phẩm"
    },
    {
      id: uuidv4(),
      slug: "edit-product",
      permission: "Chỉnh sửa sản phẩm"
    },
    {
      id: uuidv4(),
      slug: "delete-product",
      permission: "Xóa sản phẩm"
    },
    {
      id: uuidv4(),
      slug: "list-order",
      permission: "Danh sách đơn hàng"
    },
    {
      id: uuidv4(),
      slug: "detail-order",
      permission: "Chi tiết đơn hàng"
    },
    {
      id: uuidv4(),
      slug: "edit-order",
      permission: "Chỉnh sửa đơn hàng"
    },
    {
      id: uuidv4(),
      slug: "list-inventory",
      permission: "Danh sách kho hàng"
    },
    {
      id: uuidv4(),
      slug: "add-inventory",
      permission: "Thêm kho hàng"
    },
    {
      id: uuidv4(),
      slug: "edit-inventory",
      permission: "Chỉnh sửa kho hàng"
    },
   ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("permissions", null, {});
  }
};
