'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
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
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      balance: {
        type: Sequelize.NUMERIC,
        allowNull: false,
        defaultValue: 0,
      },
      color: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '#3b82f6',
      },
      icon: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'Wallet',
      },
    }, {
      schema: 'public',
    });

    // UNIQUE constraint on name
    await queryInterface.addConstraint('accounts', {
      fields: ['name'],
      type: 'unique',
      name: 'accounts_name_unique',
    });

    // Enable RLS
    await queryInterface.sequelize.query(`
      ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
    `);

    // RLS Policy
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public accounts" ON public.accounts;
      CREATE POLICY "Enable all access for public accounts" ON public.accounts
        FOR ALL USING (true) WITH CHECK (true);
    `);

    // Seed initial accounts
    await queryInterface.bulkInsert('accounts', [
      { name: 'Cash',         balance: 0, color: '#10b981', icon: 'Banknote'  },
      { name: 'Bank Mandiri', balance: 0, color: '#3b82f6', icon: 'Building2' },
      { name: 'E-Wallet',     balance: 0, color: '#f59e0b', icon: 'Smartphone'},
    ], {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accounts');
  },
};
