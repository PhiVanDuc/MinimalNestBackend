'use strict';

const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const event = await queryInterface.sequelize.query(
      'SELECT id FROM events WHERE slug = :slug',
      {
        replacements: { slug: 'giam-gia-mua-he-2025' },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    const eventId = event[0].id;

    return queryInterface.bulkInsert('coupons', [
      {
        id: uuidv4(),
        event_id: eventId,
        code: 'SUMMER25',
        desc: 'Phiếu giảm giá 100K cho toàn bộ khách hàng!',
        discount_type: 'amount',
        discount_price: 100000,
        quantity: 100,
        min_order_total: null,
        min_items: null,
        customer_type: 'all',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        event_id: eventId,
        code: 'FIRSTTIME-SUMMER2025',
        desc: 'Phiếu giảm giá 300K cho khách hàng lần đầu!',
        discount_type: 'amount',
        discount_price: 300000,
        quantity: 200,
        min_order_total: null,
        min_items: null,
        customer_type: "first_time_customer",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        event_id: eventId,
        code: 'NEW-SUMMER2025',
        desc: 'Phiếu giảm giá 200k cho khách hàng mới!',
        discount_type: 'amount',
        discount_price: 200000,
        quantity: 50,
        min_order_total: null,
        min_items: null,
        customer_type: 'new_customer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        event_id: eventId,
        code: 'VIP-SUMMER2025',
        desc: 'Phiếu giảm giá 300K cho khách hàng thân thiết!',
        discount_type: 'amount',
        discount_price: 300000,
        quantity: 50,
        min_order_total: null,
        min_items: null,
        customer_type: 'vip_customer',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('coupons', null, {});
  }
};