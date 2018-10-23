'use strict';

const path = require('path');

module.exports = {
    test: {
        client: 'sqlite3',
        connection: {
            filename: path.join(__dirname, '../../dev/test.sqlite3')
        },
        useNullAsDefault: true,
        migrations: {
            directory: path.join(__dirname, '../../src/database/migrations')
        }
    },
    development: {
        client: 'sqlite3',
        connection: {
            filename: path.join(__dirname, '../../dev/test.sqlite3')
        },
        useNullAsDefault: true,
        migrations: {
            directory: path.join(__dirname, '../../src/database/migrations')
        }
    },
    staging: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'postgresql',
        connection: {
            database: 'my_db',
            user: 'username',
            password: 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
