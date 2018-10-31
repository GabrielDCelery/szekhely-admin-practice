'use strict';

const { Model } = require('objection');
const Knex = require('knex');
const config = require('config');
const _ = require('lodash');

const knex = Knex(config.get(['knex', process.env.NODE_ENV]));

Model.knex(knex);

const AuthAdmin = require('./auth/Admin');
const AuthGroup = require('./auth/Group');
const AuthResource = require('./auth/Resource');

const AuthAdminModel = require('../models/AuthAdmin');
const AuthGroupModel = require('../models/AuthGroup');
const AuthResourceModel = require('../models/AuthResource');

const CONTROLLERS = {
    auth: {
        admin: new AuthAdmin({ AuthAdmin: AuthAdminModel }),
        group: new AuthGroup({ AuthGroup: AuthGroupModel }),
        resource: new AuthResource({ AuthResource: AuthResourceModel })
    }
};

const get = _name => {
    const _controller = _.get(CONTROLLERS, _name, null);

    if (!_controller) {
        throw new Error(`Tried to get non-existent controller -> ${_name}`);
    }

    return _controller;
};

module.exports = {
    get: get
};
