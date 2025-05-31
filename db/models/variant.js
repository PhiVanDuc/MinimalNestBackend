'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Variant extends Model {
    static associate(models) {
      Variant.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });

      Variant.belongsTo(models.Color, {
        foreignKey: 'color_id',
        as: 'color'
      });

      Variant.belongsTo(models.Size, {
        foreignKey: 'size_id',
        as: 'size'
      });
    }
  }
  Variant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    color_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    size_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Variant',
    tableName: 'variants',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Variant;
};