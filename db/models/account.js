'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.belongsToMany(models.Role, {
        through: 'accounts_roles',
        foreignKey: 'account_id',
        otherKey: 'role_id',
        as: 'roles'
      });

      Account.hasOne(models.Cart, {
        foreignKey: "account_id",
        as: "cart"
      });

      Account.hasMany(models.BookAddress, {
        foreignKey: "account_id",
        as: "book_addresses"
      });

      Account.hasMany(models.Order, {
        foreignKey: "account_id",
        as: "orders"
      });

      Account.hasMany(models.ReturnGoods, {
        foreignKey: "account_id",
        as: "return_goods"
      });
    }
  }
  Account.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "first_time_customer"
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked'),
      defaultValue: "active",
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Account;
};