'use strict';

const CustomDbError = require('../../../helpers/CustomDbError');

class Group {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.ERROR_STATUS_GROUP = 'Inactive group!';
    }

    async addNew (_name) {
        return this.models.AuthGroup
            .query()
            .insert({
                name: _name,
                status: this.STATUS_INACTIVE
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }

    async activate (_name) {
        return this.models.AuthGroup
            .query()
            .update({ status: this.STATUS_ACTIVE })
            .where('name', _name);
    }
}

module.exports = Group;
