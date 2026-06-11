'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('api_keys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: { tableName: 'users', schema: 'public' }, key: 'id' },
        onDelete: 'CASCADE',
      },
      key_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    }, {
      schema: 'public',
    });

    // Enable RLS
    await queryInterface.sequelize.query(`
      ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
    `);

    // RLS Policy
    await queryInterface.sequelize.query(`
      CREATE POLICY "Users can manage their own API keys" ON public.api_keys
    `);

    // Index for faster lookup
    await queryInterface.addIndex('api_keys', ['key_hash'], {
      name: 'idx_api_keys_key_hash',
    });

    // Function to verify API key
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.verify_api_key(key_to_check TEXT)
      RETURNS TABLE (authorized_user_id UUID)
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        UPDATE public.api_keys
        SET last_used_at = NOW()
        WHERE key_hash = key_to_check
        RETURNING user_id;
      END;
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS public.verify_api_key(TEXT);
    `);
    await queryInterface.dropTable('api_keys');
  },
};
