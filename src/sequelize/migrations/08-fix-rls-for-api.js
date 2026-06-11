'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fixPolicy = async (table, policyName) => {
      await queryInterface.sequelize.query(`
        DROP POLICY IF EXISTS "${policyName}" ON public.${table};
        CREATE POLICY "${policyName}" ON public.${table}
          FOR ALL
          USING (
            OR
          )
          WITH CHECK (
            OR
          );
      `);
    };

    await fixPolicy('categories',   'Users can only access their own categories');
    await fixPolicy('accounts',     'Users can only access their own accounts');
    await fixPolicy('transactions', 'Users can only access their own transactions');
  },

  async down(queryInterface, Sequelize) {
    const revertPolicy = async (table, policyName) => {
      await queryInterface.sequelize.query(`
        DROP POLICY IF EXISTS "${policyName}" ON public.${table};
        CREATE POLICY "${policyName}" ON public.${table}
          FOR ALL
      `);
    };

    await revertPolicy('categories',   'Users can only access their own categories');
    await revertPolicy('accounts',     'Users can only access their own accounts');
    await revertPolicy('transactions', 'Users can only access their own transactions');
  },
};
