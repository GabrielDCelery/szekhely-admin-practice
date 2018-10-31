'use strict';

const CustomDbError = require('../../../helpers/CustomDbError');
const ControllerEnumValidator = require('../../../helpers/ControllerEnumValidator');

class Group {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.ERROR_STATUS_GROUP = 'Inactive group!';
        this.statusEnumValidator = new ControllerEnumValidator(this, 'STATUS');
    }

    async addNew (_name, _status) {
        return this.models.AuthGroup
            .query()
            .insert({
                name: _name,
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE
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
