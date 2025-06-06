'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reserved_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      expired_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(`NOW() + INTERVAL '10 minutes'`)
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
    await queryInterface.dropTable('reserved_orders');
  }
};