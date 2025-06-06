'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LivingSpace extends Model {
    static associate(models) {
      LivingSpace.belongsToMany(models.Product, {
        through: 'products_living_spaces',
        foreignKey: 'living_space_id',
        otherKey: 'product_id',
        as: 'products'
      });

      LivingSpace.belongsToMany(models.Discount, {
        through: "discounts_living_spaces",
        foreignKey: "living_space_id",
        otherKey: "discount_id",
        as: "discounts"
      });
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