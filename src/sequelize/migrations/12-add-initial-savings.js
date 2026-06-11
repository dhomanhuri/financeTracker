'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('financial_freedom_entries', 'initial_savings', {
      type: Sequelize.NUMERIC,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('financial_freedom_entries', 'initial_savings');
  },
};
