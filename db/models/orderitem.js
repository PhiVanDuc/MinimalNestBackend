'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order"
      });

      OrderItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product"
      });

      OrderItem.belongsTo(models.Variant, {
        foreignKey: "variant_id",
        as: "variant"
      })
    }
  }
  OrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code_color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size_desc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cost_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    price_discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    sub_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return OrderItem;
};