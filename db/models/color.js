'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    static associate(models) {
      Color.hasMany(models.Variant, {
        foreignKey: 'color_id',
        as: 'variants'
      });

      Color.hasMany(models.ProductImage, {
        foreignKey: 'color_id',
        as: 'product_images'
      });
    }
  }
  Color.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Color',
    tableName: 'colors',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Color;
};