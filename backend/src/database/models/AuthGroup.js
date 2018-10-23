'use strict';

const { Model } = require('objection');

class AuthGroup extends Model {
    static get tableName () {
        return 'auth_groups';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                status: { type: 'integer' }
            }
        };
    }
}

module.exports = AuthGroup;
