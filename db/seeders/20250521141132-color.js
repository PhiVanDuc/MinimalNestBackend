'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('colors', [
      { id: uuidv4(), slug: 'trang', color: 'Trắng', code: '#FFFFFF', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'trang-sua', color: 'Trắng sữa', code: '#FAF3E0', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'den', color: 'Đen', code: '#000000', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xam-dam', color: 'Xám đậm', code: '#4A4A4A', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xam-nhat', color: 'Xám nhạt', code: '#CCCCCC', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nau-dam', color: 'Nâu đậm', code: '#5D4037', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nau-nhat', color: 'Nâu nhạt', code: '#A1887F', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nau-vang-dam', color: 'Nâu vàng đậm', code: '#B8860B', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'nau-vang-nhat', color: 'Nâu vàng nhạt', code: '#D2B48C', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'xanh-la-cay-nhat', color: 'Xanh lá cây nhạt', code: '#A8D5BA', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('colors', null, {});
  }
};