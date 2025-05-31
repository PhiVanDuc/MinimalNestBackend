'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Size extends Model {
    static associate(models) {
      Size.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category"
      });

      Size.hasMany(models.Variant, {
        foreignKey: 'size_id',
        as: 'variants'
      });
    }
  }
  Size.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Size',
    tableName: 'sizes',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Size;
};