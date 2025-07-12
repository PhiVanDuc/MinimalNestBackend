'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('return_goods_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      return_goods_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "return_goods",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "products",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      variant_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "variants",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code_color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size_desc: {
        type: Sequelize.STRING,
        allowNull: false
      },
      return_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      price_discount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      sub_total: {
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
    await queryInterface.dropTable('return_goods_items');
  }
};