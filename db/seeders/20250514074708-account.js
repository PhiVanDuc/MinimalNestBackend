'use strict';

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync("123456", salt);

    return queryInterface.bulkInsert('accounts', [
      {
        id: uuidv4(),
        first_name: "Phí",
        last_name: "Văn Đức",
        full_name: "Phí Văn Đức",
        email: "phivanduc325@gmail.com",
        password: hashPassword,
        status: "active"
      },
      {
        id: uuidv4(),
        first_name: "Nguyễn",
        last_name: "Long Dương",
        full_name: "Nguyễn Long Dương",
        email: "phid808@gmail.com",
        password: hashPassword,
        status: "active"
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete("accounts", null, {});
  }
};