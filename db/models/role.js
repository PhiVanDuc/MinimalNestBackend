'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.Permission, {
        through: 'roles_permissions',
        foreignKey: 'role_id',
        otherKey: 'permission_id',
        as: 'permissions'
      });

      Role.belongsToMany(models.Account, {
        through: 'accounts_roles',
        foreignKey: 'role_id',
        otherKey: 'account_id',
        as: 'accounts'
      });
    }
  }
  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Role;
};