'use strict';

const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

class LegalEntity extends Model {
    static get tablerName () {
        return 'legal_entities';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                registration_id: { type: 'string' },
                tax_id: { type: 'string' },
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

module.exports = LegalEntity;
