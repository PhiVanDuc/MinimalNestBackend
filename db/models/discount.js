'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    static associate(models) {
      Discount.hasMany(models.Product, {
        foreignKey: "general_discount_id",
        as: "products"
      });

      Discount.belongsToMany(models.ProductType, {
        through: "discounts_product_types",
        foreignKey: "discount_id",
        otherKey: "product_type_id",
        as: "product_types"
      });

      Discount.belongsToMany(models.Category, {
        through: "discounts_categories",
        foreignKey: "discount_id",
        otherKey: "category_id",
        as: "categories"
      });

      Discount.belongsToMany(models.LivingSpace, {
        through: "discounts_living_spaces",
        foreignKey: "discount_id",
        otherKey: "living_space_id",
        as: "living_spaces"
      });
    }
  }
  Discount.init({
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
    discount_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apply_all: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    discount_type: {
      type: DataTypes.ENUM('amount', 'percent'),
      allowNull: true
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Discount',
    tableName: 'discounts',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Discount;
};