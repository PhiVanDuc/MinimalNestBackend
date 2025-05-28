'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LivingSpace extends Model {
    static associate(models) {
    }
  }
  LivingSpace.init({
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
    living_space: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LivingSpace',
    tableName: 'living_spaces',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return LivingSpace;
};