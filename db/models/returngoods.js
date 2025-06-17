'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReturnGoods extends Model {
    static associate(models) {
      ReturnGoods.belongsTo(models.Account, {
        foreignKey: "account_id",
        as: "account"
      });

      ReturnGoods.hasMany(models.ReturnGoodsItem, {
        foreignKey: "return_goods_id",
        as: "return_goods_items"
      });
    }
  }
  ReturnGoods.init({
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
    payment_method: {
      type: DataTypes.ENUM("cod", "stripe"),
      allowNull: false
    },
    bank_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_intent_id: {
      type: DataTypes?.STRING,
      allowNull: true
    },
    cancel_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "shipping", "canceled", "fulfilled"),
      allowNull: false,
      defaultValue: "pending"
    },
    refund_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    is_refunded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ReturnGoods',
    tableName: 'return_goods',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ReturnGoods;
};