'use strict';

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 60);

    await queryInterface.bulkInsert('events', [
      {
        id: uuidv4(),
        image: 'https://res.cloudinary.com/dhsdqfv5f/image/upload/v1749475890/events/Event_2_qzt12r.webp',
        public_id: 'event1_public_id',
        slug: 'vat-lieu-xanh-cho-nha-them-xanh-mat',
        event: 'Vật liệu xanh cho nhà thêm xanh mát',
        desc: 'Sự kiện quảng bá sản phẩm mới với mục tiêu bảo vệ môi trường.',
        link: '',
        event_type: 'promote-product',
        start_date: today,
        end_date: endDate,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        image: 'https://res.cloudinary.com/dhsdqfv5f/image/upload/v1749479101/events/Event_2_ld5wol.png',
        public_id: 'event2_public_id',
        slug: 'giam-gia-mua-he-2025',
        event: 'Giảm giá mùa hè 2025',
        desc: 'Giảm tới 20% cho nhiều sản phẩm tại mùa hè năm 2025.',
        link: '/phieu-giam-gia?events=giam-gia-mua-he-2025&signature=f521d7b6324ce9f56c8cc0438e2894a3170b7a197402243f30c7cc71b088d77c',
        event_type: 'discount',
        start_date: today,
        end_date: endDate,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', null, {});
  }
};