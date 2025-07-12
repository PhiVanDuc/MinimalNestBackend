'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    const [accounts] = await queryInterface.sequelize.query(
      `SELECT id FROM accounts WHERE email = 'phivanduc325@gmail.com' LIMIT 1;`
    );

    if (!accounts.length) {
      throw new Error("Không tìm thấy tài khoản với email 'phivanduc325@gmail.com'");
    }

    const accountId = accounts[0].id;

    await queryInterface.bulkInsert('book_addresses', [
      {
        id: uuidv4(),
        account_id: accountId,
        full_name: "Phí Văn Đức",
        phone_number: '0328895451',
        address: 'Trường Đại học Thủy Lợi, 175 Tây Sơn, Đống Đa, Hà Nội',
        default_address: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        account_id: accountId,
        full_name: "Phí Văn Đức",
        phone_number: '0328895451',
        address: 'Trường Đại học Thủy Lợi, 175 Tây Sơn, Đống Đa, Hà Nội - Địa chỉ 2',
        default_address: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('book_addresses', null, {});
  }
};
