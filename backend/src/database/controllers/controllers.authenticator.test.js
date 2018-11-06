'use strict';

const _ = require('lodash');
const controllers = require('./controllers');
const isHex = require('is-hex');
const randomstring = require('randomstring');
const CustomDbError = require('../helpers/CustomDbError');

const REG_EXP_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

const createTestEmail = () => {
    return `${randomstring.generate(16)}@gmail.com`;
};

const createTestName = () => {
    return randomstring.generate(16);
};

describe('Authenticator controller', () => {
    const controller = controllers.get('authenticator');

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

    describe('addNewAdmin (_email, _password, _status)', () => {
        test('adds a new administrator', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNewAdmin(_email, 'somepassword');

            expect(REG_EXP_UUID.test(_admin.id)).toBeTruthy();
            expect(_admin.email).toEqual(_email);
        });

        test('generates a random salt and salted+hashed password for the new administrator', async () => {
            const _spyCreateSalt = jest.spyOn(controller, '_createSalt');
            const _spySaltAndHashPassword = jest.spyOn(controller, '_saltAndHashPassword');
            const _email = createTestEmail();
            const _admin = await controller.addNewAdmin(_email, 'somepassword');

            const _salt = await _spyCreateSalt.mock.results[0].value;
            const _saltedAndHashedPassword = await _spySaltAndHashPassword.mock.results[0].value;

            expect(_spyCreateSalt).toHaveBeenCalledTimes(1);
            expect(_spySaltAndHashPassword).toHaveBeenCalledWith(_salt, 'somepassword');
            expect(_admin.salt).toEqual(_salt);
            expect(_admin.password).toEqual(_saltedAndHashedPassword);

            _spyCreateSalt.mockRestore();
            _spySaltAndHashPassword.mockRestore();
        });

        test('sets the new administrator to inactive by default', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNewAdmin(_email, 'somepassword');

            expect(_admin.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('sets the new administrator to non super admin by default', async () => {
            const _admin = await controller.addNewAdmin(createTestEmail(), 'somepassword');

            expect(_admin.is_super).toEqual(false);
        });

        test('sets the new administrator\'s failed login attempts to 0', async () => {
            const _admin = await controller.addNewAdmin(createTestEmail(), 'somepassword');

            expect(_admin.num_of_failed_login_attempts).toEqual(0);
        });

        test('throws an error if the email is not valid', async () => {
            try {
                await controller.addNewAdmin('notanemail', 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_SHOULD_MATCH_PATTERN);
            }

            throw new Error('Expected test to throw!');
        });

        test('throws an error if the user is already registered', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNewAdmin(_email, 'somepassword');
                await controller.addNewAdmin(_email, 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_DUPLICATE_RECORD);
            }

            throw new Error('Expected test to throw!');
        });

        test('sets the administrator active if the "_status" flag is set to active', async () => {
            const _email = createTestEmail();
            const _admin = await controller.addNewAdmin(_email, 'somepassword', controller.STATUS_ACTIVE);

            expect(_admin.email).toEqual(_email);
            expect(_admin.status).toEqual(controller.STATUS_ACTIVE);
        });
    });

    describe('changeAdminStatus (_email, _status)', () => {
        test('changes the status of an administrator', async () => {
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);

            const _admin = await controller.models.AuthAdmin.query().where({ email: _email }).first();

            expect(_admin.email).toEqual(_email);
            expect(_admin.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('does not change the status of other users', async () => {
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');

            expect(await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE)).toEqual(1);
        });
    });

    describe('authenticateAdminByEmailAndPassword (_email, _password)', () => {
        test('authenticates administrator', async () => {
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);

            const _admin = await controller.authenticateAdminByEmailAndPassword(_email, 'somepassword');

            expect(_admin.email).toEqual(_email);
        });

        test('throws an error if user is inactive', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNewAdmin(_email, 'somepassword');
                await controller.authenticateAdminByEmailAndPassword(_email, 'somepassword');
            } catch (_error) {
                return expect(_error.message).toEqual(controller.ERROR_ACCOUNT_INACTIVE);
            }

            throw new Error('Expected test to throw!');
        });

        test('throws an error if password is invalid', async () => {
            try {
                const _email = createTestEmail();

                await controller.addNewAdmin(_email, 'somepassword');
                await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);
                await controller.authenticateAdminByEmailAndPassword(_email, 'wrongpassword');
            } catch (_error) {
                return expect(_error.message).toEqual(controller.ERROR_PASSWORD_INVALID);
            }

            throw new Error('Expected test to throw!');
        });

        test('disables account after too many failed login attempts', async () => {
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);

            for (let _i = 1, _iMax = controller.MAX_FAILED_LOGIN_ATTEMPTS; _i < _iMax; _i++) {
                try {
                    await controller.authenticateAdminByEmailAndPassword(_email, 'wrongpassword');
                } catch (_error) {
                    const _admin = await controller.models.AuthAdmin.query().where({ email: _email }).first();

                    expect(_admin.num_of_failed_login_attempts).toEqual(_i);
                    expect(_error.message).toEqual(controller.ERROR_PASSWORD_INVALID);

                    continue;
                }

                throw new Error('Expected test to throw!');
            }

            try {
                await controller.authenticateAdminByEmailAndPassword(_email, 'wrongpassword');
            } catch (_error) {
                const _admin = await controller.models.AuthAdmin.query().where({ email: _email }).first();

                expect(_admin.num_of_failed_login_attempts).toEqual(controller.MAX_FAILED_LOGIN_ATTEMPTS);
                expect(_admin.status).toEqual(controller.STATUS_DISABLED);
                expect(_error.message).toEqual(controller.ERROR_ACCOUNT_LOCKED);

                return;
            }

            throw new Error('Expected test to throw!');
        });
    });

    describe('createJWTTokenForAdmin (_email, _password)', () => {
        test('creates a signed jwt token', async () => {
            const REG_EXP_JWT = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);

            const _token = await controller.createJWTTokenForAdmin(_email, 'somepassword');

            expect(REG_EXP_JWT.test(_token)).toBeTruthy();
        });

        test('validates the user email and password', async () => {
            const _email = createTestEmail();
            const _spyAuthenticateByEmailAndPassword = jest.spyOn(controller, 'authenticateAdminByEmailAndPassword');

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);
            await controller.createJWTTokenForAdmin(_email, 'somepassword');

            expect(_spyAuthenticateByEmailAndPassword).toHaveBeenCalledTimes(1);
            expect(_spyAuthenticateByEmailAndPassword).toHaveBeenCalledWith(_email, 'somepassword');
        });
    });

    describe('authenticateAdminByJWTToken (_jwtToken)', () => {
        test('validates a jwt token issed by the system', async () => {
            const _email = createTestEmail();

            await controller.addNewAdmin(_email, 'somepassword');
            await controller.changeAdminStatus(_email, controller.STATUS_ACTIVE);

            const _token = await controller.createJWTTokenForAdmin(_email, 'somepassword');
            const _decoded = await controller.authenticateAdminByJWTToken(_token);

            expect(_decoded.email).toEqual(_email);
        });
    });

    describe('addNewGroup (_name)', () => {
        test('adds a new administrative group', async () => {
            const _name = createTestName();
            const _group = await controller.addNewGroup(_name);

            expect(REG_EXP_UUID.test(_group.id)).toBeTruthy();
            expect(_group.name).toEqual(_name);
        });

        test('sets the new group to inactive by default', async () => {
            const _group = await controller.addNewGroup(createTestName());

            expect(_group.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('throws an error if the group is already registered', async () => {
            try {
                const _name = createTestName();

                await controller.addNewGroup(_name);
                await controller.addNewGroup(_name);
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_DUPLICATE_RECORD);
            }

            throw new Error('Expected test to throw!');
        });

        test('sets the group to active if the "_status" flag is set to active', async () => {
            const _name = createTestName();
            const _group = await controller.addNewGroup(_name, controller.STATUS_ACTIVE);

            expect(_group.name).toEqual(_name);
            expect(_group.status).toEqual(controller.STATUS_ACTIVE);
        });
    });

    describe('changeGroupStatus (_name, _status)', () => {
        test('changes the status of a group', async () => {
            const _name = createTestName();

            await controller.addNewGroup(_name, 'somepassword');
            await controller.changeGroupStatus(_name, controller.STATUS_ACTIVE);

            const _admin = await controller.models.AuthGroup.query().where({ name: _name }).first();

            expect(_admin.name).toEqual(_name);
            expect(_admin.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('does not change the status of other groups', async () => {
            const _name = createTestName();

            await controller.addNewGroup(_name);

            expect(await controller.changeGroupStatus(_name, controller.STATUS_ACTIVE)).toEqual(1);
        });
    });

    describe('addNewResource (_name, _method, _status)', () => {
        test('adds a new resource', async () => {
            const _name = createTestName();
            const _resource = await controller.addNewResource(_name, controller.METHOD_GET);

            expect(REG_EXP_UUID.test(_resource.id)).toBeTruthy();
            expect(_resource.name).toEqual(_name);
            expect(_resource.method).toEqual(controller.METHOD_GET);
        });

        test('sets the new resource to inactive by default', async () => {
            const _resource = await controller.addNewResource(createTestName(), controller.METHOD_GET);

            expect(_resource.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('sets the resource to active if the "_status" flag is set to active', async () => {
            const _resource = await controller.addNewResource(createTestName(), controller.METHOD_GET, controller.STATUS_ACTIVE);

            expect(_resource.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('throws an error if the resource is already registered', async () => {
            const _name = createTestName();

            try {
                await controller.addNewResource(_name, controller.METHOD_GET);
                await controller.addNewResource(_name, controller.METHOD_GET);
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_DUPLICATE_RECORD);
            }

            throw new Error('Expected test to throw!');
        });
    });

    describe('changeResourceStatus (_name, _method, _status)', () => {
        test('changes the status of a resource', async () => {
            const _name = createTestName();

            await controller.addNewResource(_name, controller.METHOD_GET);
            await controller.changeResourceStatus(_name, controller.METHOD_GET, controller.STATUS_ACTIVE);

            const _resource = await controller.models.AuthResource
                .query()
                .where({
                    name: _name,
                    method: controller.METHOD_GET
                })
                .first();

            expect(_resource.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('does not change the status of other resources', async () => {
            const _name = createTestName();

            await controller.addNewResource(_name, controller.METHOD_GET);

            expect(await controller.changeResourceStatus(_name, controller.METHOD_GET, controller.STATUS_ACTIVE)).toEqual(1);
        });
    });

    describe('associateAdminAndGroup (_adminEmail, _groupName)', () => {
        test('creates an association between an admin and a group', async () => {
            const _emails = _.times(3, createTestEmail);
            const _groupNames = _.times(3, createTestName);

            await Promise.all(_emails.map(_email => controller.addNewAdmin(_email, 'somepassword')));

            const _groups = await Promise.all(_groupNames.map(_name => controller.addNewGroup(_name)));

            await controller.associateAdminAndGroup(_emails[0], _groupNames[0]);
            await controller.associateAdminAndGroup(_emails[0], _groupNames[1]);
            await controller.associateAdminAndGroup(_emails[0], _groupNames[2]);
            await controller.associateAdminAndGroup(_emails[1], _groupNames[1]);
            await controller.associateAdminAndGroup(_emails[1], _groupNames[2]);
            await controller.associateAdminAndGroup(_emails[2], _groupNames[2]);

            const _admins = await Promise.all(_emails.map(_email => controller.models.AuthAdmin.query().where({ email: _email }).eager('groups').first()));
            const _adminGroups = _admins.map(_admin => _admin.groups.map(_group => _group.id));

            expect(_adminGroups[0].length).toEqual(3);
            expect(_adminGroups[1].length).toEqual(2);
            expect(_adminGroups[2].length).toEqual(1);

            expect(_.includes(_adminGroups[0], _groups[0].id)).toBeTruthy();
            expect(_.includes(_adminGroups[0], _groups[1].id)).toBeTruthy();
            expect(_.includes(_adminGroups[0], _groups[2].id)).toBeTruthy();

            expect(_.includes(_adminGroups[1], _groups[1].id)).toBeTruthy();
            expect(_.includes(_adminGroups[1], _groups[2].id)).toBeTruthy();

            expect(_.includes(_adminGroups[2], _groups[2].id)).toBeTruthy();
        });
    });
/*
    describe('associateGroupAndResource (_groupName, _resourceName)', () => {
        test('creates an association between an admin and a group', async () => {
            const [_groupNameA, _groupNameB, _groupNameC] = [createTestName(), createTestName(), createTestName()];
            const [_resourceNameA, _resourceNameB, _resourceNameC] = [createTestName(), createTestName(), createTestName()];

            await controller.addNewGroup(_groupNameA);
            await controller.addNewGroup(_groupNameB);
            await controller.addNewGroup(_groupNameC);

            const _resourceA = await controller.addNewResource(_resourceNameA);
            const _resourceB = await controller.addNewResource(_resourceNameB);
            const _resourceC = await controller.addNewResource(_resourceNameC);

            await controller.associateGroupAndResource(_groupNameA, _resourceNameA);
            await controller.associateGroupAndResource(_groupNameA, _resourceNameB);
            await controller.associateGroupAndResource(_groupNameA, _resourceNameC);
            await controller.associateGroupAndResource(_groupNameB, _resourceNameB);
            await controller.associateGroupAndResource(_groupNameC, _resourceNameB);
            await controller.associateGroupAndResource(_groupNameC, _resourceNameC);

            const _groupA = await controller.models.AuthGroup.query().where({ name: _groupNameA }).eager('resources').first();
            const _groupAResources = _.map(_groupA.groups, _group => _group.id);

            expect(_groupAResources.length).toEqual(3);
            expect(_.includes(_groupAResources, _resourceA.id)).toBeTruthy();
            expect(_.includes(_groupAResources, _resourceB.id)).toBeTruthy();
            expect(_.includes(_groupAResources, _resourceC.id)).toBeTruthy();

            const _adminB = await controller.models.AuthAdmin.query().where({ email: _emailB }).eager('groups').first();
            const _adminBGroups = _.map(_adminB.groups, _group => _group.id);

            expect(_adminBGroups.length).toEqual(1);
            expect(_.includes(_adminBGroups, _groupB.id)).toBeTruthy();

            const _adminC = await controller.models.AuthAdmin.query().where({ email: _emailC }).eager('groups').first();
            const _adminCGroups = _.map(_adminC.groups, _group => _group.id);

            expect(_adminCGroups.length).toEqual(2);
            expect(_.includes(_adminCGroups, _groupB.id)).toBeTruthy();
            expect(_.includes(_adminCGroups, _groupC.id)).toBeTruthy();
        });
    });
    */
});
