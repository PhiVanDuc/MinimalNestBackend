'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookAddress extends Model {
    static associate(models) {
      BookAddress.belongsTo(models.Account, {
        foreignKey: "account_id",
        as: "account"
      });
    }
  }
  BookAddress.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    default_address: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'BookAddress',
    tableName: 'book_addresses',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return BookAddress;
};