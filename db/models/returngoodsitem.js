'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReturnGoodsItem extends Model {
    static associate(models) {
      ReturnGoodsItem.belongsTo(models.ReturnGoods, {
        foreignKey: "return_goods_id",
        as: "return_goods"
      });

      ReturnGoodsItem.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product"
      });

      ReturnGoodsItem.belongsTo(models.Variant, {
        foreignKey: "variant_id",
        as: "variant"
      });

      ReturnGoodsItem.hasMany(models.ProofImage, {
        foreignKey: "return_goods_item_id",
        as: "proof_images"
      });
    }
  }
  ReturnGoodsItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    return_goods_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code_color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size_desc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    return_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cost_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    price_discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    sub_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReturnGoodsItem',
    tableName: 'return_goods_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return ReturnGoodsItem;
};