'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Size, {
        foreignKey: "category_id",
        as: "sizes"
      })

      Category.hasMany(models.Product, {
        foreignKey: "category_id",
        as: "products"
      });

      Category.belongsToMany(models.Discount, {
        through: "discounts_categories",
        foreignKey: "category_id",
        otherKey: "discount_id",
        as: "discounts"
      });
    }
  }
  Category.init({
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
    category: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Category;
};