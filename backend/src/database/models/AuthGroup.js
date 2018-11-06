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
                name: {
                    type: 'string',
                    unique: true
                },
                status: { type: 'integer' }
            }
        };
    }

    static get relationMappings () {
        const Admin = require('./AuthAdmin');
        const Resource = require('./AuthResource');

        return {
            admins: {
                relation: Model.ManyToManyRelation,
                modelClass: Admin,
                join: {
                    from: 'auth_admins.id',
                    through: {
                        from: 'auth_admins_groups.admin_id',
                        to: 'auth_admins_groups.group_id'
                    },
                    to: 'auth_groups.id'
                }
            },
            groups: {
                relation: Model.ManyToManyRelation,
                modelClass: Resource,
                join: {
                    from: 'auth_resources.id',
                    through: {
                        from: 'auth_resources_groups.resource_id',
                        to: 'auth_resources_groups.group_id'
                    },
                    to: 'auth_groups.id'
                }
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
