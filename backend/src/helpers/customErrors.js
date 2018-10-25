'use strict';

const _ = require('lodash');

const CUSTOM_ERRORS = {
    db: require('./customErrors/DbError')
};

const errorHandlerWrapper = _name => {
    return _error => {
        const _CustomError = _.get(CUSTOM_ERRORS, [_name], null);

        if (_CustomError === null) {
            throw new Error('No custom error found!');
        }

        throw new _CustomError(_error.message);
    };
};

module.exports = {
    errorHandlerWrapper: errorHandlerWrapper
};
