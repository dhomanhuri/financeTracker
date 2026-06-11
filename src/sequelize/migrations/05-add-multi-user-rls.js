'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add user_id dengan IF NOT EXISTS agar aman jika partial sebelumnya
    await queryInterface.sequelize.query(`
      ALTER TABLE public.categories
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.accounts
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TABLE public.categories   DROP COLUMN IF EXISTS user_id;`);
    await queryInterface.sequelize.query(`ALTER TABLE public.accounts     DROP COLUMN IF EXISTS user_id;`);
    await queryInterface.sequelize.query(`ALTER TABLE public.transactions DROP COLUMN IF EXISTS user_id;`);
  },
};
