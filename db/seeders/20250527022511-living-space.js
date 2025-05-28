'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('living_spaces', [
      { id: uuidv4(), slug: 'phong-khach', living_space: 'Phòng khách', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-ngu', living_space: 'Phòng ngủ', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-an', living_space: 'Phòng ăn', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-bep', living_space: 'Phòng bếp', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-tam', living_space: 'Phòng tắm', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-lam-viec', living_space: 'Phòng làm việc', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-doc-sach', living_space: 'Phòng đọc sách', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-tre-em', living_space: 'Phòng trẻ em', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-choi', living_space: 'Phòng chơi', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-giat-la', living_space: 'Phòng giặt là', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-thay-do', living_space: 'Phòng thay đồ', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-sinh-hoat-chung', living_space: 'Phòng sinh hoạt chung', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-tho', living_space: 'Phòng thờ', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-khach-nho', living_space: 'Phòng khách nhỏ', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-giai-tri', living_space: 'Phòng giải trí', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-da-nang', living_space: 'Phòng đa năng', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-tap-the-duc', living_space: 'Phòng tập thể dục', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-nghe-thuat', living_space: 'Phòng nghệ thuật', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-khach-bep-mo', living_space: 'Phòng khách - bếp mở', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'phong-giu-am', living_space: 'Phòng giữ ấm', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ban-cong-san-thuong', living_space: 'Ban công / Sân thượng', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'san-vuon', living_space: 'Sân vườn', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'gara', living_space: 'Gara', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nha-kho', living_space: 'Nhà kho', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'hanh-lang-loi-vao', living_space: 'Hành lang / Lối vào', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('living_spaces', null, {});
  }
};
