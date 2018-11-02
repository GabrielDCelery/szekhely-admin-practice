'use strict';

const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

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
                registration_number: { type: 'string' },
                tax_number: { type: 'string' },
                type: { type: 'integer' }
            }
        };
    }

    $beforeInsert () {
        const _date = new Date().toISOString();

        this.id = uuidv4();
        this.created_at = _date;
        this.updated_at = _date;
    }

    $beforeUpdate () {
        this.updated_at = new Date().toISOString();
    }
}

module.exports = AuthGroup;
