'use strict';

const { Model } = require('objection');
const Knex = require('knex');
const config = require('config');
const _ = require('lodash');

const knex = Knex(config.get(['knex', process.env.NODE_ENV]));

Model.knex(knex);

const Authenticator = require('./Authenticator');
const Contracts = require('./Contracts');

const AuthAdminModel = require('../models/AuthAdmin');
const AuthGroupModel = require('../models/AuthGroup');
const AuthResourceModel = require('../models/AuthResource');

const LegalEntityModel = require('../models/LegalEntity');
const ContractModel = require('../models/Contract');

const CONTROLLERS = {
    authenticator: new Authenticator({
        AuthAdmin: AuthAdminModel,
        AuthGroup: AuthGroupModel,
        AuthResource: AuthResourceModel
    }),
    contracts: new Contracts({
        LegalEntity: LegalEntityModel,
        Contract: ContractModel
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
