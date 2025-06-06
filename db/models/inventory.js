'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Variant, {
        foreignKey: 'variant_id',
        as: "variant"
      });
    }
  }
  Inventory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    total_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventories',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    version: true
  });
  return Inventory;
};