'use strict';

const CustomDbError = require('../../../helpers/CustomDbError');
const ControllerEnumValidator = require('../../../helpers/ControllerEnumValidator');

class Resource {
    constructor (_models) {
        this.models = _models;
        this.TYPE_COMPANIES = 0;
        this.TYPE_INVOICES = 1;
        this.TYPE_MAILS = 2;
        this.METHOD_GET = 1;
        this.METHOD_POST = 2;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.typeEnumValidator = new ControllerEnumValidator(this, 'TYPE');
        this.methodEnumValidator = new ControllerEnumValidator(this, 'METHOD');
        this.statusEnumValidator = new ControllerEnumValidator(this, 'STATUS');
    }

    async addNew (_type, _method, _status) {
        return this.models.AuthResource
            .query()
            .insert({
                type: this.typeEnumValidator.validate(_type),
                method: this.methodEnumValidator.validate(_method),
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }
    /*
    _normalizeMethod (_method) {
        if (_.isNil(_method)) {
            return null;
        }

        const _methodAsInteger = this[`METHOD_${_method.toUpperCase()}`];

        if (_.isNil(_methodAsInteger)) {
            throw new Error(`Invalid resource method -> ${_method}`);
        }

        return _methodAsInteger;
    }

    static _convertMethodToEnum (_method = '') {
        return `METHOD_${_method.toUpperCase()}`;
    }
    */
}

module.exports = Resource;
