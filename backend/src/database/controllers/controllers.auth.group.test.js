'use strict';

// const _ = require('lodash');
const controllers = require('./controllers');
const randomstring = require('randomstring');
const CustomDbError = require('../../helpers/CustomDbError');

const createGroupName = () => {
    return randomstring.generate(16);
};

describe('Admin authentication methods', () => {
    const controller = controllers.get('auth.group');

    describe('addNew (_name)', () => {
        test('adds a new administrative group', async () => {
            const _name = createGroupName();
            const _group = await controller.addNew(_name);

            expect(_group.name).toEqual(_name);
        });

        test('sets the new group to inactive by default', async () => {
            const _name = createGroupName();
            const _group = await controller.addNew(_name);

            expect(_group.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('throws an error if the group is already registered', async () => {
            try {
                const _name = createGroupName();

                await controller.addNew(_name);
                await controller.addNew(_name);
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_DUPLICATE_RECORD);
            }

            throw new Error('Test failed to run properly');
        });
    });

    describe('activate (_name)', () => {
        test('activates an administrative user', async () => {
            const _name = createGroupName();

            await controller.addNew(_name, 'somepassword');
            await controller.activate(_name);

            const _admin = await controller.models.AuthGroup.query().where({ name: _name }).first();

            expect(_admin.name).toEqual(_name);
            expect(_admin.status).toEqual(controller.STATUS_ACTIVE);
        });

        test('does not change the status of other users', async () => {
            const _name = createGroupName();

            await controller.addNew(_name);

            expect(await controller.activate(_name)).toEqual(1);
        });
    });
});
