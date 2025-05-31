'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });

      ProductImage.belongsTo(models.Color, {
        foreignKey: 'color_id',
        as: 'color'
      });      
    }
  }
  ProductImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    color_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    public_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    display_order: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ProductImage;
};