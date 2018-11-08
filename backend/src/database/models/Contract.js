'use strict';

const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

class Contract extends Model {
    static get tablerName () {
        return 'contracts';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'string' },
                start_date: { type: 'date-time' },
                end_date: { type: 'date-time' }
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

module.exports = Contract;
