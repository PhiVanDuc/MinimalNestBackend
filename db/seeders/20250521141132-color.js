'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('colors', [
      { id: uuidv4(), slug: 'trang', color: 'Trắng', code: '#FFFFFF', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'kem-beige', color: 'Kem (Beige)', code: '#F5F5DC', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xam', color: 'Xám', code: '#808080', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'den', color: 'Đen', code: '#000000', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nau-go', color: 'Nâu gỗ (Walnut)', code: '#8B4513', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xanh-duong', color: 'Xanh dương (Blue)', code: '#0000FF', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xanh-la', color: 'Xanh lá (Green)', code: '#008000', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'vang', color: 'Vàng (Mustard)', code: '#FFDB58', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'hong', color: 'Hồng (Pink)', code: '#FFC0CB', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'cam-dat', color: 'Cam đất (Terracotta)', code: '#E2725B', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'tim-nhat', color: 'Tím nhạt (Lavender)', code: '#E6E6FA', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'greige', color: 'Beige xám (Greige)', code: '#BEBEBE', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('colors', null, {});
  }
};
