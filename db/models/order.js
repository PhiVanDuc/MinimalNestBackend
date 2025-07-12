'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Account, {
        foreignKey: "account_id",
        as: "account"
      });

      Order.hasMany(models.OrderItem, {
        foreignKey: "order_id",
        as: "order_items"
      });
    }
  }
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    event: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coupon_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    discount_type: {
      type: DataTypes.ENUM("amount", "percent"),
      allowNull: true
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("pending", "packing", "shipping", "canceled", "fulfilled"),
      allowNull: false,
      defaultValue: "pending"
    },
    cancel_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_return: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    total_order_discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    total_order: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Order;
};