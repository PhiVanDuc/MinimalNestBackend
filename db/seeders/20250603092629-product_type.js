'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('product_types', [
      { id: uuidv4(), slug: 'moi-nhat', product_type: 'Mới nhất', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'ban-chay-nhat', product_type: 'Bán chạy nhất', created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), slug: 'binh-thuong', product_type: 'Bình thường', created_at: new Date(), updated_at: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('product_types', null, {});
  }
};
