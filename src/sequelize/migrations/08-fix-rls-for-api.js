'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // RLS tidak digunakan di PostgreSQL biasa (tanpa Supabase)
  // Migration ini di-skip (no-op)
  async up(queryInterface, Sequelize) {},
  async down(queryInterface, Sequelize) {},
};
