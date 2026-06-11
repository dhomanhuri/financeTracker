'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add user_id to categories
    await queryInterface.addColumn('categories', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: { tableName: 'users', schema: 'public' }, key: 'id' },
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE public.categories
    `);

    // 2. Add user_id to accounts
    await queryInterface.addColumn('accounts', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: { tableName: 'users', schema: 'public' }, key: 'id' },
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE public.accounts
    `);

    // 3. Add user_id to transactions
    await queryInterface.addColumn('transactions', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: { tableName: 'users', schema: 'public' }, key: 'id' },
    });
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions
    `);

    // Update RLS policies for categories
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public categories" ON public.categories;
      CREATE POLICY "Users can only access their own categories" ON public.categories
    `);

    // Update RLS policies for accounts
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public accounts" ON public.accounts;
      CREATE POLICY "Users can only access their own accounts" ON public.accounts
    `);

    // Update RLS policies for transactions
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public" ON public.transactions;
      CREATE POLICY "Users can only access their own transactions" ON public.transactions
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert RLS policies
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Users can only access their own categories" ON public.categories;
      CREATE POLICY "Enable all access for public categories" ON public.categories
        FOR ALL USING (true) WITH CHECK (true);
    `);
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Users can only access their own accounts" ON public.accounts;
      CREATE POLICY "Enable all access for public accounts" ON public.accounts
        FOR ALL USING (true) WITH CHECK (true);
    `);
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Users can only access their own transactions" ON public.transactions;
      CREATE POLICY "Enable all access for public" ON public.transactions
        FOR ALL USING (true) WITH CHECK (true);
    `);

    // Remove user_id columns
    await queryInterface.removeColumn('categories', 'user_id');
    await queryInterface.removeColumn('accounts', 'user_id');
    await queryInterface.removeColumn('transactions', 'user_id');
  },
};
