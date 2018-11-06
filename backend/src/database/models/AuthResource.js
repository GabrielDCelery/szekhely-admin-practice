'use strict';

const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

class AuthResource extends Model {
    static get tableName () {
        return 'auth_resources';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            /*
            required: [
                'id',
                'type',
                'method',
                'status'
            ],
            */
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                method: { type: 'integer' },
                status: { type: 'integer' }
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

module.exports = AuthResource;
