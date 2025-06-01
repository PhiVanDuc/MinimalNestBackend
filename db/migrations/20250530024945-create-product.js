'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false
      },
      desc: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      interest_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      discount_type: {
        type: Sequelize.ENUM('amount', 'percent'),
        allowNull: true
      },
      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      final_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
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
    await queryInterface.dropTable('products');
  }
};