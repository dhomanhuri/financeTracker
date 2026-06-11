'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fix accounts: remove (name) unique → add (user_id, name) unique
    await queryInterface.removeConstraint('accounts', 'accounts_name_unique')
      .catch(() => {
        // fallback: try original Sequelize-generated name
        return queryInterface.sequelize.query(`
          ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_name_key;
        `);
      });

    await queryInterface.addConstraint('accounts', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'accounts_user_id_name_key',
    });

    // 2. Fix categories: remove (name, type) unique → add (user_id, name, type) unique
    await queryInterface.removeConstraint('categories', 'categories_name_type_unique')
      .catch(() => {
        return queryInterface.sequelize.query(`
          ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_type_key;
        `);
      });

    await queryInterface.addConstraint('categories', {
      fields: ['user_id', 'name', 'type'],
      type: 'unique',
      name: 'categories_user_id_name_type_key',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert accounts
    await queryInterface.removeConstraint('accounts', 'accounts_user_id_name_key');
    await queryInterface.addConstraint('accounts', {
      fields: ['name'],
      type: 'unique',
      name: 'accounts_name_unique',
    });

    // Revert categories
    await queryInterface.removeConstraint('categories', 'categories_user_id_name_type_key');
    await queryInterface.addConstraint('categories', {
      fields: ['name', 'type'],
      type: 'unique',
      name: 'categories_name_type_unique',
    });
  },
};
