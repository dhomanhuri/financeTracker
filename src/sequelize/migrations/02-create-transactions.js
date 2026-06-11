'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("timezone('utc', now())"),
      },
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      amount: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
      type: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
      },
    }, {
      schema: 'public',
    });

    // CHECK constraint for type
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions
        ADD CONSTRAINT transactions_type_check
        CHECK (type IN ('income', 'expense'));
    `);

    // Enable RLS
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    `);

    // RLS Policy
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public" ON public.transactions;
      CREATE POLICY "Enable all access for public" ON public.transactions
        FOR ALL USING (true) WITH CHECK (true);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  },
};
