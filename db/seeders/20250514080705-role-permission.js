'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Fetch all roles and permissions
    const roles = await queryInterface.sequelize.query(
      'SELECT id, slug FROM roles',
      { type: QueryTypes.SELECT }
    );
    const permissions = await queryInterface.sequelize.query(
      'SELECT id, slug FROM permissions',
      { type: QueryTypes.SELECT }
    );

    // Map permission slugs to their IDs
    const permMap = {};
    permissions.forEach(p => {
      permMap[p.slug] = p.id;
    });

    // Define which permissions each non-super-admin role should have
    const mapping = {
      'quan-ly-bang-thong-ke': ['all-dashboard'],
      'quan-ly-vai-tro': ['list-role', 'add-role', 'edit-role', 'delete-role'],
      'quan-ly-tai-khoan': ['list-account', 'edit-account'],
      'quan-ly-su-kien': ['list-event', 'add-event', 'edit-event', 'delete-event'],
      'quan-ly-phieu-giam-gia': ['list-coupon', 'add-coupon', 'edit-coupon', 'delete-coupon'],
      'quan-ly-mau-sac': ['list-color', 'add-color', 'edit-color', 'delete-color'],
      'quan-ly-kich-co': ['list-size', 'add-size', 'edit-size', 'delete-size'],
      'quan-ly-san-pham': ['list-product', 'add-product', 'edit-product', 'delete-product'],
      'quan-ly-don-hang': ['list-order', 'detail-order', 'edit-order'],
      'quan-ly-kho-hang': ['list-inventory', 'add-inventory', 'edit-inventory'],
    };

    const rolePermissions = [];

    // Build role-permission pairs
    roles.forEach(role => {
      // Every role gets the 'admin' permission
      let slugs = ['admin'];

      if (role.slug === 'sieu-quan-tri') {
        // Super-admin gets all permissions
        slugs = Object.keys(permMap);
      } else if (mapping[role.slug]) {
        // Add specific permissions
        slugs = slugs.concat(mapping[role.slug]);
      }

      // Dedupe and collect pairs
      Array.from(new Set(slugs)).forEach(slug => {
        const permId = permMap[slug];
        if (permId) {
          rolePermissions.push({
            role_id: role.id,
            permission_id: permId
          });
        }
      });
    });

    // Seed the join table
    return queryInterface.bulkInsert('roles_permissions', rolePermissions);
  },

  async down (queryInterface, Sequelize) {
    // Remove all seeded role-permission associations
    await queryInterface.bulkDelete('roles_permissions', null, {});
  }
};
