'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add account_id column to transactions (nullable FK to accounts)
    await queryInterface.addColumn('transactions', 'account_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'account_id');
  },
};
