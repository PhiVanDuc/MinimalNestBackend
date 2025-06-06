'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reserved_order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      reserved_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "reserved_orders",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "variants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      quantity: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('reserved_order_items');
  }
};