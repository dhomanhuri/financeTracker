'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create categories table
    await queryInterface.createTable('categories', {
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
      type: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['income', 'expense']],
        },
      },
    }, {
      schema: 'public',
    });

    // Add UNIQUE constraint (name, type)
    await queryInterface.addConstraint('categories', {
      fields: ['name', 'type'],
      type: 'unique',
      name: 'categories_name_type_unique',
    });

    // Add CHECK constraint for type
    await queryInterface.sequelize.query(`
      ALTER TABLE public.categories
        ADD CONSTRAINT categories_type_check
        CHECK (type IN ('income', 'expense'));
    `);

    // Enable RLS
    await queryInterface.sequelize.query(`
      ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    `);

    // RLS Policy
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Enable all access for public categories" ON public.categories;
      CREATE POLICY "Enable all access for public categories" ON public.categories
        FOR ALL USING (true) WITH CHECK (true);
    `);

    // Seed initial categories
    await queryInterface.bulkInsert('categories', [
      { name: 'Makanan & Minuman', type: 'expense' },
      { name: 'Transportasi',      type: 'expense' },
      { name: 'Belanja',           type: 'expense' },
      { name: 'Hiburan',           type: 'expense' },
      { name: 'Tagihan',           type: 'expense' },
      { name: 'Kesehatan',         type: 'expense' },
      { name: 'Pendidikan',        type: 'expense' },
      { name: 'Lainnya',           type: 'expense' },
      { name: 'Gaji',              type: 'income'  },
      { name: 'Bonus',             type: 'income'  },
      { name: 'Investasi',         type: 'income'  },
      { name: 'Hadiah',            type: 'income'  },
      { name: 'Lainnya',           type: 'income'  },
    ], {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  },
};
