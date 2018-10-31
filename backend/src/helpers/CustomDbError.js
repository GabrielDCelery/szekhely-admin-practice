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

        this.message = this._getReplaceMessage(_message);
    }

    _getReplaceMessage (_message) {
        const _keys = Object.keys(this.errorLookups);

        for (let _i = 0, _iMax = _keys.length; _i < _iMax; _i++) {
            if (_message.match(_keys[_i])) {
                return this.errorLookups[_keys[_i]];
            }
        }

        return _message;
    }

    static get ERROR_DUPLICATE_RECORD () {
        return 'Duplicate record!';
    }

    static get ERROR_SHOULD_MATCH_PATTERN () {
        return 'Column does not match pattern!';
    }
}

module.exports = CustomDbError;
