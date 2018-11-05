'use strict';

const { Model } = require('objection');
const Knex = require('knex');
const config = require('config');
const _ = require('lodash');

const knex = Knex(config.get(['knex', process.env.NODE_ENV]));

Model.knex(knex);

const Authenticator = require('./Authenticator');

const AuthAdminModel = require('../models/AuthAdmin');
const AuthGroupModel = require('../models/AuthGroup');
const AuthResourceModel = require('../models/AuthResource');

const CONTROLLERS = {
    authenticator: new Authenticator({
        AuthAdmin: AuthAdminModel,
        AuthGroup: AuthGroupModel,
        AuthResource: AuthResourceModel
    })
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
