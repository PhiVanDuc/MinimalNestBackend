'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('roles', [
      {
        id: uuidv4(),
        slug: "sieu-quan-tri",
        role: "Siêu quản trị",
        desc: "Vai trò cao nhất của hệ thống."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-bang-thong-ke",
        role: "Quản lý bảng thống kê",
        desc: "Vai trò liên quan đến bảng thống kê."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-vai-tro",
        role: "Quản lý vai trò",
        desc: "Vai trò liên quan đến vai trò."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-tai-khoan",
        role: "Quản lý tài khoản",
        desc: "Vai trò liên quan đến tài khoản."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-su-kien",
        role: "Quản lý sự kiện",
        desc: "Vai trò liên quan đến sự kiện."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-phieu-giam-gia",
        role: "Quản lý phiếu giảm giá",
        desc: "Vai trò liên quan đến phiếu giảm giá."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-mau-sac",
        role: "Quản lý màu sắc",
        desc: "Vai trò liên quan đến màu sắc."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-kich-co",
        role: "Quản lý kích cỡ",
        desc: "Vai trò liên quan đến kích cỡ."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-san-pham",
        role: "Quản lý sản phẩm",
        desc: "Vai trò liên quan đến sản phẩm."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-ton-kho",
        role: "Quản lý tồn kho",
        desc: "Vai trò liên quan đến tồn kho sản phẩm."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-don-hang",
        role: "Quản lý đơn hàng",
        desc: "Vai trò liên quan đến đơn hàng."
      },
      {
        id: uuidv4(),
        slug: "quan-ly-tra-hang",
        role: "Quản lý trả hàng",
        desc: "Vai trò liên quan đến trả hàng."
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("roles", null, {});
  }
};
