'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_return_goods_status;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_return_goods_status" AS ENUM (
        'pending',
        'shipping', 
        'canceled', 
        'fulfilled'
      );
    `);

    await queryInterface.createTable('return_goods', {
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
      payment_method: {
        type: Sequelize.ENUM("cod", "stripe"),
        allowNull: false
      },
      bank_info: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_intent_id: {
        type: Sequelize?.STRING,
        allowNull: true
      },
      cancel_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM("pending", "shipping", "canceled", "fulfilled"),
        allowNull: false,
        defaultValue: "pending"
      },
      refund_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      is_refunded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('return_goods');
  }
};