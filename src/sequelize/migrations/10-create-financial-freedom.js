'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financial_freedom_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: { tableName: 'users', schema: 'public' }, key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("timezone('utc', now())"),
      },
      monthly_savings:  { type: Sequelize.NUMERIC, allowNull: false, defaultValue: 0 },
      annual_savings:   { type: Sequelize.NUMERIC, allowNull: false, defaultValue: 0 },
      return_rate:      { type: Sequelize.NUMERIC, allowNull: false, defaultValue: 0 },
      monthly_expenses: { type: Sequelize.NUMERIC, allowNull: false, defaultValue: 0 },
      annual_expenses:  { type: Sequelize.NUMERIC, allowNull: false, defaultValue: 0 },
      monthly_income:   { type: Sequelize.NUMERIC, allowNull: true,  defaultValue: 0 },
      dependents:       { type: Sequelize.INTEGER, allowNull: true,  defaultValue: 0 },
      target_amount:    { type: Sequelize.NUMERIC, allowNull: true,  defaultValue: 0 },
    }, { schema: 'public' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('financial_freedom_entries');
  },
};
