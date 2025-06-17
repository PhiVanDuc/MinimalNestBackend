'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_orders_status;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_orders_status" AS ENUM (
        'pending', 
        'packing', 
        'shipping', 
        'canceled', 
        'fulfilled'
      );
    `);

    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      account_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "accounts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coupon_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      discount_type: {
        type: Sequelize.ENUM("amount", "percent"),
        allowNull: true
      },
      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      total_order_discount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      total_order: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("pending", "packing", "shipping", "canceled", "fulfilled"),
        allowNull: false,
        defaultValue: "pending"
      },
      cancel_message: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('orders');
  }
};