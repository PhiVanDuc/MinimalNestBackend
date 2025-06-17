'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReservedOrder extends Model {
    static associate(models) {
      ReservedOrder.belongsTo(models.Account, {
        foreignKey: "account_id",
        as: "account"
      });

      ReservedOrder.hasMany(models.ReservedOrderItem, {
        foreignKey: "reserved_order_id",
        as: "reserved_order_items"
      });
    }
  }
  ReservedOrder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        return now;
      }
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ReservedOrder',
    tableName: 'reserved_orders',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ReservedOrder;
};