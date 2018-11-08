'use strict';

const { Model } = require('objection');

class AuthAdminPasswordActivation extends Model {
    static get tableName () {
        return 'auth_admins_password_activation';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            required: [
                'id',
                'admin_id',
                'activation_code',
                'expires_at'
            ],
            properties: {
                id: { type: 'string' },
                admin_id: { type: 'string' },
                activation_code: { type: 'string' },
                expires_at: { type: 'string' }
            }
        };
    }

    $beforeInsert () {
        const _date = new Date().toISOString();

        this.created_at = _date;
        this.updated_at = _date;
    }

    $beforeUpdate () {
        this.updated_at = new Date().toISOString();
    }
}

module.exports = AuthAdminPasswordActivation;
