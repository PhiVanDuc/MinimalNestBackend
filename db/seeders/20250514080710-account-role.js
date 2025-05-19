'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const role = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE slug='sieu-quan-tri' LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
    );

    const account = await queryInterface.sequelize.query(
      `SELECT id FROM "accounts" WHERE email='phivanduc325@gmail.com' LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        plain: true
      }
    );

    queryInterface.bulkInsert("accounts_roles", [
      {
        account_id: account.id,
        role_id: role.id
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("accounts_roles", null, {});
  }
};
