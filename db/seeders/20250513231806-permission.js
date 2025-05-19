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
      permission: "Tất cả"
    },
    {
      id: uuidv4(),
      slug: "list-role",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-role",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-role",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-role",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-account",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "edit-account",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "list-event",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-event",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-event",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-event",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-coupon",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-coupon",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-coupon",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-coupon",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-color",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-color",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-color",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-color",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-size",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-size",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-size",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-size",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-product",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "add-product",
      permission: "Thêm"
    },
    {
      id: uuidv4(),
      slug: "edit-product",
      permission: "Chỉnh sửa"
    },
    {
      id: uuidv4(),
      slug: "delete-product",
      permission: "Xóa"
    },
    {
      id: uuidv4(),
      slug: "list-order",
      permission: "Xem danh sách"
    },
    {
      id: uuidv4(),
      slug: "detail-order",
      permission: "Xem chi tiết"
    },
    {
      id: uuidv4(),
      slug: "edit-order",
      permission: "Chỉnh sửa"
    },
   ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("permissions", null, {});
  }
};
