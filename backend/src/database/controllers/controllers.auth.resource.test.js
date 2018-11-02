'use strict';

// const _ = require('lodash');
const controllers = require('./controllers');
const CustomDbError = require('../../helpers/CustomDbError');

describe('Admin resource controller', () => {
    const controller = controllers.get('auth.resource');

    describe('addNew (_type, _method, _status)', () => {
        test('adds a new resource', async () => {
            const REG_EXP_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            const _resource = await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET);

            expect(REG_EXP_UUID.test(_resource.id)).toBeTruthy();
            expect(_resource.type).toEqual(controller.TYPE_COMPANIES);
            expect(_resource.method).toEqual(controller.METHOD_GET);

            await controller.models.AuthResource
                .query()
                .delete()
                .where({ id: _resource.id });
        });

        test('sets the new resource to inactive by default', async () => {
            const _resource = await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET);

            expect(_resource.status).toEqual(controller.STATUS_INACTIVE);

            await controller.models.AuthResource
                .query()
                .delete()
                .where({ id: _resource.id });
        });

        test('sets the resource to active if the "_status" flag is set to active', async () => {
            const _resource = await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET, controller.STATUS_ACTIVE);

            expect(_resource.status).toEqual(controller.STATUS_ACTIVE);

            await controller.models.AuthResource
                .query()
                .delete()
                .where({ id: _resource.id });
        });

        test('throws an error if the resource is already registered', async () => {
            try {
                await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET);
                await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET);
            } catch (_error) {
                return expect(_error.message).toEqual(CustomDbError.ERROR_DUPLICATE_RECORD);
            }

            throw new Error('Expected test to throw!');
        });
    });
});
