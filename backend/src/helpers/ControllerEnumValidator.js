'use strict';

class ControllerEnumValidator {
    constructor (_controller, _keyPrefix) {
        this.controller = _controller;
        this.keyPrefix = _keyPrefix;
        this.keysToEval = Object.keys(this.controller).filter(_key => {
            return _key.match(this.keyPrefix) !== null;
        });
    }

    validate (_value, _bReturnNullIfNoMatch) {
        for (let _i = 0, _iMax = this.keysToEval.length; _i < _iMax; _i++) {
            if (this.controller[this.keysToEval[_i]] === _value) {
                return _value;
            }
        }

        if (_bReturnNullIfNoMatch === true) {
            return null;
        }

        throw new Error(`Could not find accepted ENUM on controller for ${this.keyPrefix} -> ${_value}`);
    }
}

module.exports = ControllerEnumValidator;
