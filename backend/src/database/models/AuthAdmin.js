'use strict';

const { Model } = require('objection');
const uuidv4 = require('uuid/v4');

class AuthAdmin extends Model {
    static get tableName () {
        return 'auth_admins';
    }

    static get jsonSchema () {
        return {
            type: 'object',
            /*
            required: [
                'email',
                'password',
                'salt',
                'status'
            ],
            */
            properties: {
                id: { type: 'string' },
                email: {
                    type: 'string',
                    unique: true,
                    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}'
                },
                password: { type: 'string' },
                salt: { type: 'string' },
                is_super: { type: 'boolean' },
                num_of_failed_login_attempts: { type: 'integer' },
                status: { type: 'integer' }
            }
        };
    }

    static get relationMappings () {
        const Group = require('./AuthGroup');

        return {
            groups: {
                relation: Model.ManyToManyRelation,
                modelClass: Group,
                join: {
                    from: 'auth_admins.id',
                    through: {
                        from: 'auth_admins_groups.admin_id',
                        to: 'auth_admins_groups.group_id'
                    },
                    to: 'auth_groups.id'
                }
            }
        };
    }

    $beforeInsert () {
        const _date = new Date().toISOString();

        this.id = uuidv4();
        this.num_of_failed_login_attempts = 0;
        this.created_at = _date;
        this.updated_at = _date;
    }

    $beforeUpdate () {
        this.updated_at = new Date().toISOString();
    }
}

module.exports = AuthAdmin;
