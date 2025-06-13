'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.Account, {
        foreignKey: "account_id",
        as: "account"
      });

      Cart.hasMany(models.CartItem, {
        foreignKey: "cart_id",
        as: "cart_items"
      });
    }
  }
  Cart.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Cart;
};