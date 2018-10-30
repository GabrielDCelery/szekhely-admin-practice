'use strict';

const _ = require('lodash');

class CustomDbError extends Error {
    constructor (_message) {
        super(_message);

        if (_.isNil(_message)) {
            return this;
        }

        this.errorLookups = {
            'should match pattern': CustomDbError.ERROR_SHOULD_MATCH_PATTERN,
            'SQLITE_CONSTRAINT: UNIQUE constraint failed': CustomDbError.ERROR_DUPLICATE_RECORD
        };

        this._replaceMessage(_message);
    }

    _replaceMessage (_message) {
        _.forEach(this.errorLookups, (_customErrorMessage, _k) => {
            if (_message.match(_k)) {
                this.message = _customErrorMessage;

                return false;
            }
        });
    }

    static get ERROR_DUPLICATE_RECORD () {
        return 'Duplicate record!';
    }

    static get ERROR_SHOULD_MATCH_PATTERN () {
        return 'Column does not match pattern!';
    }
}

module.exports = CustomDbError;
