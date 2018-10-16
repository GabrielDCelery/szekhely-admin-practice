'use strict';

const { Model } = require('objection');

class Person extends Model {
    static get tableName () {
        return 'persons';
    }

    static get relationMappings () {
        return {
            children: {
                relation: Model.HasManyRelation,
                modelClass: Person,
                join: {
                    from: 'persons.id',
                    to: 'persons.parentId'
                }
            }
        };
    }
}

module.exports = Person;
