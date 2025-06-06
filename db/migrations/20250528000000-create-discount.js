'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('discounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false
      },
      discount_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apply_all: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      discount_type: {
        type: Sequelize.ENUM('amount', 'percent'),
        allowNull: true
      },
      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('discounts');
  }
};