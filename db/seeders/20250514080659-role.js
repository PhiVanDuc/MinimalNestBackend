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
      ...Array.from({ length: 40 }, (_, i) => ({
        id: uuidv4(),
        slug: `test-${i + 1}`,
        role: `Test ${i + 1}`,
        desc: `Đây là vai trò Test ${i + 1}.`
      }))
    ])
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("roles", null, {});
  }
};
