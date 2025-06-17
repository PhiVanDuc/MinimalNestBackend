'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProofImage extends Model {
    static associate(models) {
      ProofImage.belongsTo(models.ReturnGoodsItem, {
        foreignKey: "return_goods_item_id",
        as: "return_goods_item"
      });
    }
  }
  ProofImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    return_goods_item_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    public_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProofImage',
    tableName: 'proof_images',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ProofImage;
};