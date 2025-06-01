'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });

      Product.belongsToMany(models.LivingSpace, {
        through: 'products_living_spaces',
        foreignKey: 'product_id',
        otherKey: 'living_space_id',
        as: 'living_spaces'
      });

      Product.hasMany(models.Variant, {
        foreignKey: 'product_id',
        as: 'variants'
      });

      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "product_images"
      })
    }
  }
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cost_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    interest_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('amount', 'percent'),
      allowNull: true
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    final_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Product;
};