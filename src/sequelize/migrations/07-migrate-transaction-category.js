'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add category_id column (nullable first for migration)
    await queryInterface.addColumn('transactions', 'category_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    });

    // 2. Migrate existing data: match category text → category_id
    await queryInterface.sequelize.query(`
      UPDATE public.transactions t
      SET category_id = c.id
      FROM public.categories c
      WHERE t.category = c.name AND t.type = c.type;
    `);

    // 3. Set category_id NOT NULL after migration
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions
        ALTER COLUMN category_id SET NOT NULL;
    `);

    // 4. Drop old category text column
    await queryInterface.removeColumn('transactions', 'category');

    // 5. Add index for performance
    await queryInterface.addIndex('transactions', ['category_id'], {
      name: 'idx_transactions_category_id',
    });
  },

  async down(queryInterface, Sequelize) {
    // Re-add category text column
    await queryInterface.addColumn('transactions', 'category', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Restore data from category_id
    await queryInterface.sequelize.query(`
      UPDATE public.transactions t
      SET category = c.name
      FROM public.categories c
      WHERE t.category_id = c.id;
    `);

    // Make category NOT NULL again
    await queryInterface.sequelize.query(`
      ALTER TABLE public.transactions
        ALTER COLUMN category SET NOT NULL;
    `);

    // Remove index and category_id
    await queryInterface.removeIndex('transactions', 'idx_transactions_category_id');
    await queryInterface.removeColumn('transactions', 'category_id');
  },
};
