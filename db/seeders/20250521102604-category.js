'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('categories', [
      { id: uuidv4(), slug: 'ban-an', category: 'Bàn ăn', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ban-lam-viec', category: 'Bàn làm việc', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ban-tra', category: 'Bàn trà', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ghe-an', category: 'Ghế ăn', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ghe-sofa', category: 'Ghế sofa', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ghe-xoay', category: 'Ghế xoay', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ghe-banh', category: 'Ghế bành', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'giuong', category: 'Giường', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'tu-dau-giuong', category: 'Tủ đầu giường', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'tu-ao', category: 'Tủ áo', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ke-sach', category: 'Kệ sách', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ke-trang-tri', category: 'Kệ trang trí', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'tham', category: 'Thảm', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'den-cay', category: 'Đèn cây', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'den-tha', category: 'Đèn thả', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'guong', category: 'Gương', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'decor', category: 'Đồ trang trí (Decor)', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'do-phu-kien', category: 'Phụ kiện nội thất', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  }
};