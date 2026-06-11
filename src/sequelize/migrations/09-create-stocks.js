'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stocks', {
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
      symbol: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      lots: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
      buy_price: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
    }, {
      schema: 'public',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE public.stocks
    `);

    // UNIQUE constraint (user_id, symbol)
    await queryInterface.addConstraint('stocks', {
      fields: ['user_id', 'symbol'],
      type: 'unique',
      name: 'stocks_user_id_symbol_key',
    });

    // Enable RLS
    await queryInterface.sequelize.query(`
      ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
    `);

    // RLS Policy
    await queryInterface.sequelize.query(`
      DROP POLICY IF EXISTS "Users can only access their own stocks" ON public.stocks;
      CREATE POLICY "Users can only access their own stocks" ON public.stocks
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stocks');
  },
};
