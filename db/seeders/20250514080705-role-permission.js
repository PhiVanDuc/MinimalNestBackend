'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Lấy role SIÊU QUẢN TRỊ
    const superRole = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE slug = 'sieu-quan-tri' LIMIT 1;`,
      { type: QueryTypes.SELECT, plain: true }
    );

    // Lấy toàn bộ permissions
    const allPermissions = await queryInterface.sequelize.query(
      `SELECT id FROM "permissions" ORDER BY id;`,
      { type: QueryTypes.SELECT }
    );

    // Lấy 8 permission đầu tiên
    const firstEight = allPermissions.slice(0, 8);

    // Lấy các role còn lại (ngoại trừ siêu quản trị)
    const otherRoles = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE slug != 'sieu-quan-tri';`,
      { type: QueryTypes.SELECT }
    );

    // Chuẩn bị dữ liệu để bulkInsert
    const seedData = [];

    // Siêu quản trị có tất cả permissions
    allPermissions.forEach(({ id: permission_id }) => {
      seedData.push({
        role_id: superRole.id,
        permission_id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    // Các role khác chỉ có 8 permission đầu tiên
    otherRoles.forEach(({ id: role_id }) => {
      firstEight.forEach(({ id: permission_id }) => {
        seedData.push({
          role_id,
          permission_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    });

    return queryInterface.bulkInsert('roles_permissions', seedData, {});
  },

  async down (queryInterface, Sequelize) {
    // Xóa toàn bộ dữ liệu roles_permissions đã seed
    await queryInterface.bulkDelete('roles_permissions', null, {});
  }
};
