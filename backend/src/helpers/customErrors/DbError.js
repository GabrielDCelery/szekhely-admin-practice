'use strict';

const _ = require('lodash');

const CUSTOM_ERROR_MESSAGES = {
    'email: should match pattern': 'Invalid email!',
    'SQLITE_CONSTRAINT: UNIQUE constraint failed: auth_admins.email': 'Email already exists!'
};

class DbError extends Error {
    constructor (_message) {
        super(_message);

        this._replaceMessage(_message);
    }

    _replaceMessage (_message) {
        _.forEach(CUSTOM_ERROR_MESSAGES, (_customErrorMessage, _k) => {
            if (_message.match(_k)) {
                this.message = _customErrorMessage;

                return false;
            }
        });
    }
}

module.exports = DbError;
