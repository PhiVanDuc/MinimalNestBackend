'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, {
        foreignKey: "cart_id",
        as: "cart"
      });

      CartItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product"
      });

      CartItem.belongsTo(models.Variant, {
        foreignKey: "variant_id",
        as: "variant"
      });
    }
  }
  CartItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return CartItem;
};