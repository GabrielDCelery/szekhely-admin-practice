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

    describe('_saltAndHashPassword (_password)', () => {
        test('creates a 32 bytes 64 characters long hexadecimal salt', () => {
            const { salt } = controller._saltAndHashPassword('somepassword');

            expect(salt).toHaveLength(64);
            expect(isHex(salt)).toBeTruthy();
        });

        test('creates a 32 bytes 64 characters long hexadecimal password', async () => {
            const { saltedAndHashedPassword } = controller._saltAndHashPassword('somepassword');

            expect(saltedAndHashedPassword).toHaveLength(64);
            expect(isHex(saltedAndHashedPassword)).toBeTruthy();
        });
    });

    describe('addNew (_email, _password)', async () => {
        test('adds a new administrative user', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNew(_email, 'somepassword');

            expect(!_.isNil(_admin)).toBeTruthy();
        });

        test('generates a random salt and salted+hashed password for the new administrative user', async () => {
            const _spy = jest.spyOn(controller, '_saltAndHashPassword');
            const _email = createTestEmail();
            const _admin = await controller.addNew(_email, 'somepassword');

            expect(_spy).toHaveBeenCalledTimes(1);
            expect(_spy).toHaveBeenCalledWith('somepassword');
            expect(_admin.email).toEqual(_email);
            expect(_admin.password).toEqual(_spy.mock.results[0].value.saltedAndHashedPassword);
            expect(_admin.salt).toEqual(_spy.mock.results[0].value.salt);

            _spy.mockRestore();
        });

        test('throws an error if the email is not valid', async () => {
            expect(async () => {
                await controller.addNew('notanemail', 'somepassword');
            }).toThrow();
        });

        test('sets the new administrator to inactive by default', async () => {
            const _admin = await controller.addNew(createTestEmail(), 'somepassword');

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

        test('throws an error if the user is already registered', async () => {
            const _email = createTestEmail();

            await controller.addNew(_email, 'somepassword');

            expect(async () => {
                await controller.addNew(_email, 'somepassword');
            }).toThrow();
        });
    });

    describe('validateByEmailAndPassword (_email, _password)', () => {
    });

    describe('validateByJWTToken (_jwt)', () => {
    });
});
