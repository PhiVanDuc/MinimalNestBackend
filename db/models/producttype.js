'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductType extends Model {
    static associate(models) {
      ProductType.belongsToMany(models.Product, {
        through: "products_product_types",
        foreignKey: "product_type_id",
        otherKey: "product_id",
        as: "products"
      });

      ProductType.belongsToMany(models.Discount, {
        through: "discounts_product_types",
        foreignKey: "product_type_id",
        otherKey: "discount_id",
        as: "discounts"
      });
    }
  }
  ProductType.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    product_type: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'ProductType',
    tableName: 'product_types',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ProductType;
};