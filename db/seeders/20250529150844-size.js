'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch all categories
    const categories = await queryInterface.sequelize.query(
      `SELECT id, slug, category FROM categories;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Define groups and their dimension templates
    const dimensionTemplates = {
      seating: {
        S: { w: 40, d: 40, h: 80 },
        M: { w: 45, d: 45, h: 85 },
        L: { w: 50, d: 50, h: 90 },
        XL: { w: 55, d: 55, h: 95 }
      },
      table: {
        S: { l: 100, w: 60, h: 75 },
        M: { l: 120, w: 70, h: 75 },
        L: { l: 140, w: 80, h: 75 },
        XL: { l: 160, w: 90, h: 75 }
      },
      bed: {
        S: { l: 190, w: 90, h: 40 },
        M: { l: 200, w: 150, h: 40 },
        L: { l: 200, w: 180, h: 40 },
        XL: { l: 220, w: 200, h: 40 }
      },
      storage: {
        S: { w: 60, d: 45, h: 120 },
        M: { w: 80, d: 50, h: 180 },
        L: { w: 100, d: 60, h: 200 },
        XL: { w: 120, d: 70, h: 220 }
      },
      rug: {
        S: { w: 120, l: 160, t: 0.5 },
        M: { w: 160, l: 230, t: 0.5 },
        L: { w: 200, l: 300, t: 0.5 },
        XL: { w: 250, l: 350, t: 0.5 }
      },
      decor: {
        S: { w: 30, d: 30, h: 50 },
        M: { w: 50, d: 50, h: 70 },
        L: { w: 70, d: 70, h: 90 },
        XL: { w: 90, d: 90, h: 110 }
      }
    };
    const sizeLabels = ['S', 'M', 'L', 'XL'];
    const now = new Date();
    const seeds = [];

    // Helper to determine group by slug
    function getGroup(slug) {
      if (/^(ghe|sofa)/.test(slug)) return 'seating';
      if (/^ban-/.test(slug) || slug === 'ban-tra') return 'table';
      if (slug === 'giuong') return 'bed';
      if (/^tu-|^ke-/.test(slug)) return 'storage';
      if (slug === 'tham') return 'rug';
      return 'decor';
    }

    categories.forEach(cat => {
      const group = getGroup(cat.slug);
      sizeLabels.forEach(size => {
        const dims = dimensionTemplates[group][size];
        let desc = '';
        switch (group) {
          case 'seating':
            desc = `Rộng ${dims.w}cm, sâu ${dims.d}cm, cao ${dims.h}cm`;
            break;
          case 'table':
          case 'bed':
          case 'storage':
          case 'decor':
            desc = `Dài ${dims.l || dims.w}cm, rộng ${dims.w}cm, cao ${dims.h}cm`;
            break;
          case 'rug':
            desc = `Rộng ${dims.w}cm, dài ${dims.l}cm, dày ${dims.t}cm`;
            break;
        }

        seeds.push({
          id: uuidv4(),
          category_id: cat.id,
          size,
          desc,
          created_at: now,
          updated_at: now
        });
      });
    });

    return queryInterface.bulkInsert('sizes', seeds, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('sizes', null, {});
  }
};