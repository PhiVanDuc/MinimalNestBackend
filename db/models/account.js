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
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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