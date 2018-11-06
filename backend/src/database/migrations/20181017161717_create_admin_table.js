'use strict';

exports.up = _knex => {
    return (async () => {
        await _knex.schema.createTable('auth_admins', _table => {
            _table.uuid('id').primary();
            _table.string('email').unique();
            _table.string('password');
            _table.string('salt');
            _table.boolean('is_super').defaultTo(false);
            _table.integer('num_of_failed_login_attempts').defaultTo(0);
            _table.integer('status');
            _table.timestamps();
        });

        await _knex.schema.createTable('auth_groups', _table => {
            _table.uuid('id').primary();
            _table.string('name').unique();
            _table.integer('status');
            _table.timestamps();
        });

        await _knex.schema.createTable('auth_resources', _table => {
            _table.uuid('id').primary();
            _table.string('name');
            _table.integer('method');
            _table.integer('status');
            _table.timestamps();
            _table.unique(['name', 'method']);
        });

        await _knex.schema.createTable('auth_admins_password_activation', _table => {
            _table.uuid('id').primary();
            _table.uuid('admin_id').references('id').inTable('auth_admins');
            _table.uuid('activation_code');
            _table.dateTime('expires_at');
            _table.timestamps();
        });

        await _knex.schema.createTable('auth_admins_groups', _table => {
            _table.uuid('admin_id').references('id').inTable('auth_admins').onDelete('CASCADE');
            _table.uuid('group_id').references('id').inTable('auth_groups').onDelete('CASCADE');
            _table.unique(['admin_id', 'group_id']);
        });

        await _knex.schema.createTable('auth_resources_groups', _table => {
            _table.uuid('resource_id').references('id').inTable('auth_resources').onDelete('CASCADE');
            _table.uuid('group_id').references('id').inTable('auth_groups').onDelete('CASCADE');
            _table.unique(['resource_id', 'group_id']);
        });
    })();
};

exports.down = _knex => {
    return (async () => {
        await _knex.schema.dropTableIfExists('auth_admins');
        await _knex.schema.dropTableIfExists('auth_groups');
        await _knex.schema.dropTableIfExists('auth_resources');
        await _knex.schema.dropTableIfExists('auth_admins_password_activation');
        await _knex.schema.dropTableIfExists('auth_admins_groups');
        await _knex.schema.dropTableIfExists('auth_resources_groups');
    })();
};
