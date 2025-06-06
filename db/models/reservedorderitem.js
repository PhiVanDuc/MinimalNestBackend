'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReservedOrderItem extends Model {
    static associate(models) {
      ReservedOrderItem.belongsTo(models.ReservedOrder, {
        foreignKey: "reserved_order_id",
        as: "reserved_order"
      });

      ReservedOrderItem.belongsTo(models.Variant, {
        foreignKey: "variant_id",
        as: "variant"
      });
    }
  }
  ReservedOrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    reserved_order_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReservedOrderItem',
    tableName: 'reserved_order_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ReservedOrderItem;
};