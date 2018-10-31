'use strict';

const ControllerEnumValidator = require('./ControllerEnumValidator');

describe('ControllerEnumValidator (_value, _bReturnNullIfNoMatch)', () => {
    describe('validate (_value, _bReturnNullIfNoMatch)', () => {
        const Controller = class Controller {
            constructor () {
                this.STATUS_INACTIVE = 0;
                this.STATUS_ACTIVE = 1;
            }
        };

        test('it validates an ENUM value provided on a controller', () => {
            const _controller = new Controller();
            const _statusEnumValidator = new ControllerEnumValidator(_controller, 'STATUS');

            expect(_statusEnumValidator.validate(_controller.STATUS_INACTIVE)).toEqual(_controller.STATUS_INACTIVE);
            expect(_statusEnumValidator.validate(_controller.STATUS_ACTIVE)).toEqual(_controller.STATUS_ACTIVE);
        });

        test('throws an error if ENUM value is not specified on the controller', () => {
            const _controller = new Controller();
            const _statusEnumValidator = new ControllerEnumValidator(_controller, 'STATUS');

            try {
                _statusEnumValidator.validate('foo');
            } catch (_error) {
                return expect(_error.message).toEqual('Could not find accepted ENUM on controller for STATUS -> foo');
            }

            throw new Error('Expected test to throw!');
        });

        test('returns null for invalid value if "_bReturnNullIfNoMatch" is set to true', () => {
            const _controller = new Controller();
            const _statusEnumValidator = new ControllerEnumValidator(_controller, 'STATUS');

            expect(_statusEnumValidator.validate('foo', true)).toEqual(null);
        });
    });
});
