'use strict';

const _ = require('lodash');
const controllers = require('./controllers');
const isHex = require('is-hex');
const randomstring = require('randomstring');

const createTestEmail = () => {
    return `${randomstring.generate(16)}@gmail.com`;
};

describe('Admin authentication methods', () => {
    const controller = controllers.get('auth.admin');

    describe('_createSalt ()', () => {
        test('creates a 32 bytes 64 characters long hexadecimal salt', async () => {
            const _salt = await controller._createSalt();

            expect(_salt).toHaveLength(64);
            expect(isHex(_salt)).toBeTruthy();
        });
    });

    describe('_saltAndHashPassword (_salt, _password)', () => {
        test('creates a 32 bytes 64 characters long hexadecimal password', async () => {
            const _salt = await controller._createSalt();
            const _saltedAndHashedPassword = await controller._saltAndHashPassword(_salt, 'somerandompassword');

            expect(_saltedAndHashedPassword).toHaveLength(64);
            expect(isHex(_saltedAndHashedPassword)).toBeTruthy();
        });
    });

    describe('addNew (_email, _password)', () => {
        test('adds a new administrative user', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNew(_email, 'somepassword');

            expect(!_.isNil(_admin)).toBeTruthy();
        });

        test('generates a random salt and salted+hashed password for the new administrative user', async () => {
            const _spyCreateSalt = jest.spyOn(controller, '_createSalt');
            const _spySaltAndHashPassword = jest.spyOn(controller, '_saltAndHashPassword');
            const _email = createTestEmail();
            const _admin = await controller.addNew(_email, 'somepassword');

            const _salt = await _spyCreateSalt.mock.results[0].value;
            const _saltedAndHashedPassword = await _spySaltAndHashPassword.mock.results[0].value;

            expect(_spyCreateSalt).toHaveBeenCalledTimes(1);
            expect(_spySaltAndHashPassword).toHaveBeenCalledWith(_salt, 'somepassword');
            expect(_admin.email).toEqual(_email);
            expect(_admin.salt).toEqual(_salt);
            expect(_admin.password).toEqual(_saltedAndHashedPassword);

            _spyCreateSalt.mockRestore();
            _spySaltAndHashPassword.mockRestore();
        });

        test('sets the new administrator to inactive by default', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNew(_email, 'somepassword');

            expect(_admin.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('sets the new administrator to non super admin by default', async () => {
            const _admin = await controller.addNew(createTestEmail(), 'somepassword');

            expect(_admin.is_super).toEqual(false);
        });

        test('sets the new administrator\'s failed login attempts to 0', async () => {
            const _admin = await controller.addNew(createTestEmail(), 'somepassword');

            expect(_admin.num_of_failed_login_attempts).toEqual(0);
        });

        test('throws an error if the email is not valid', async () => {
            try {
                await controller.addNew('notanemail', 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual('Invalid email!');
            }

            throw new Error('Test failed to run properly');
        });

        test('throws an error if the user is already registered', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNew(_email, 'somepassword');
                await controller.addNew(_email, 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual('Email already exists!');
            }

            throw new Error('Test failed to run properly');
        });
    });

    describe('activate (_email)', () => {
        test('activates an administrative user', async () => {
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');
            await controller.activate(_email);

            const _admin = await controller.models.AuthAdmin.query().where({ email: _email }).first();

            expect(_admin.email).toEqual(_email);
            expect(_admin.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('does not change the status of other users', async () => {
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');

            expect(await controller.activate(_email)).toEqual(1);
        });
    });

    describe('authenticateByEmailAndPassword (_email, _password)', () => {
        test('authenticates administrative user', async () => {
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');
            await controller.activate(_email);

            const _admin = await controller.authenticateByEmailAndPassword(_email, 'somepassword');

            expect(_admin.email).toEqual(_email);
        });

        test('throws an error if user is inactive', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNew(_email, 'somepassword');
                await controller.authenticateByEmailAndPassword(_email, 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual(controller.ERROR_STATUS_INACTIVE);
            }

            throw new Error('Test failed to run properly');
        });

        test('throws an error if password is invalid', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNew(_email, 'somepassword');
                await controller.activate(_email);
                await controller.authenticateByEmailAndPassword(_email, 'wrongpassword');
            } catch (_error) {
                return expect(_error.message).toEqual(controller.ERROR_PASSWORD_INVALID);
            }

            throw new Error('Test failed to run properly');
        });
    });

    describe('createJWTToken (_email, _password)', () => {
        test('creates a signed jwt token', async () => {
            const REGEXP_JWT = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');
            await controller.activate(_email);

            const _token = await controller.createJWTToken(_email, 'somepassword');

            expect(REGEXP_JWT.test(_token)).toBeTruthy();
        });

        test('validates the user email and password', async () => {
            const _email = createTestEmail();
            const _spyAuthenticateByEmailAndPassword = jest.spyOn(controller, 'authenticateByEmailAndPassword');

            await controller.addNew(_email, 'somepassword');
            await controller.activate(_email);
            await controller.createJWTToken(_email, 'somepassword');

            expect(_spyAuthenticateByEmailAndPassword).toHaveBeenCalledTimes(1);
            expect(_spyAuthenticateByEmailAndPassword).toHaveBeenCalledWith(_email, 'somepassword');
        });
    });

    describe('authenticateByJWTToken (_jwtToken)', () => {
        test('validates a jwt token issed by the system', async () => {
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');
            await controller.activate(_email);

            const _token = await controller.createJWTToken(_email, 'somepassword');
            const _decoded = await controller.authenticateByJWTToken(_token);

            expect(_decoded.email).toEqual(_email);
        });
    });
});
