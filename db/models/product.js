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
      });

      Product.belongsTo(models.Discount, {
        foreignKey: "general_discount_id",
        as: "general_discount"
      });

      Product.belongsToMany(models.ProductType, {
        through: "products_product_types",
        foreignKey: "product_id",
        otherKey: "product_type_id",
        as: "product_types"
      });

      Product.hasMany(models.CartItem, {
        foreignKey: "product_id",
        as: "cart_items"
      });

      Product.hasMany(models.ReservedOrderItem, {
        foreignKey: "product_id",
        as: "reserved_order_items"
      });

      Product.hasMany(models.OrderItem, {
        foreignKey: "product_id",
        as: "order_items"
      });

      Product.hasMany(models.ReturnGoodsItem, {
        foreignKey: "product_id",
        as: "return_goods_items"
      });
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
    general_discount_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null
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
    modelName: 'Product',
    tableName: 'products',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Product;
};