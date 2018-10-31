'use strict';

// const _ = require('lodash');
const controllers = require('./controllers');
const randomstring = require('randomstring');
const CustomDbError = require('../../helpers/CustomDbError');

describe('Admin resource controller', () => {
    const controller = controllers.get('auth.resource');

    describe('addNew (_type, _method, _status)', () => {
        test('adds a new resource', async () => {
            const _resource = await controller.addNew(controller.TYPE_COMPANIES, controller.METHOD_GET);

            expect(_resource.type).toEqual(controller.TYPE_COMPANIES);
            expect(_resource.method).toEqual(controller.METHOD_GET);
            expect(_resource.status).toEqual(controller.STATUS_INACTIVE);
        });

        test('sets the new resource to inactive by default', async () => {
        });

        test('throws an error if the resource is already registered', async () => {
        });

        test('sets the resource to active if the "_status" flag is set to active', async () => {
        });
    });
});
