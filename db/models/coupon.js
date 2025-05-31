'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.belongsTo(models.Event, {
        foreignKey: "event_id",
        as: "event"
      });
    }
  }
  Coupon.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('percent', 'amount'),
      allowNull: false,
      defaultValue: 'amount'
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    min_order_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    min_items: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    customer_type: {
      type: DataTypes.ENUM('all', 'first_time', 'new', 'vip'),
      allowNull: false,
      defaultValue: 'all'
    }
  }, {
    sequelize,
    modelName: 'Coupon',
    tableName: 'coupons',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Coupon;
};