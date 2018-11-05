'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CustomDbError = require('../../helpers/CustomDbError');
const EnvironmentVariables = require('../../helpers/EnvironmentVariables');
const ControllerEnumValidator = require('../../helpers/ControllerEnumValidator');

const ENV_VARIABLE_JWT_SECRET = EnvironmentVariables.get('JWT_SECRET');

class Authenticator {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.TYPE_COMPANIES = 0;
        this.TYPE_INVOICES = 1;
        this.TYPE_MAILS = 2;
        this.METHOD_GET = 1;
        this.METHOD_POST = 2;
        this.ERROR_STATUS_INACTIVE = 'Inactive user!';
        this.ERROR_PASSWORD_INVALID = 'Invalid password!';
        this.ERROR_STATUS_GROUP = 'Inactive group!';
        this.JWT_EXPIRES_IN = 28800;
        this.typeEnumValidator = new ControllerEnumValidator(this, 'TYPE');
        this.methodEnumValidator = new ControllerEnumValidator(this, 'METHOD');
        this.statusEnumValidator = new ControllerEnumValidator(this, 'STATUS');
    }

    _createSalt () {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (_error, _buffer) => {
                if (_error) {
                    return reject(_error);
                };

                return resolve(_buffer.toString('hex'));
            });
        });
    }

    _saltAndHashPassword (_salt, _password) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(_password, _salt, 100000, 32, 'sha512', (_error, _derivedKey) => {
                if (_error) {
                    return reject(_error);
                };

                return resolve(_derivedKey.toString('hex'));
            });
        });
    }

    async addNewAdmin (_email, _password, _status) {
        const _salt = await this._createSalt();
        const _saltedAndHashedPassword = await this._saltAndHashPassword(_salt, _password);

        return this.models.AuthAdmin
            .query()
            .insert({
                email: _email,
                password: _saltedAndHashedPassword,
                salt: _salt,
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE,
                is_super: false
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }

    async activateAdmin (_email) {
        return this.models.AuthAdmin
            .query()
            .update({ status: this.STATUS_ACTIVE })
            .where('email', _email);
    }

    async authenticateAdminByEmailAndPassword (_email, _password) {
        const _admin = await this.models.AuthAdmin
            .query()
            .select('email', 'salt', 'password', 'status')
            .where('email', _email)
            .first();

        if (_admin.status === this.STATUS_INACTIVE) {
            throw new Error(this.ERROR_STATUS_INACTIVE);
        }

        if (await this._saltAndHashPassword(_admin.salt, _password) !== _admin.password) {
            throw new Error(this.ERROR_PASSWORD_INVALID);
        }

        return {
            email: _admin.email
        };
    }

    async createJWTTokenForAdmin (_email, _password) {
        const _admin = await this.authenticateAdminByEmailAndPassword(_email, _password);

        return new Promise((resolve, reject) => {
            jwt.sign(_admin, ENV_VARIABLE_JWT_SECRET, {
                expiresIn: this.JWT_EXPIRES_IN
            }, (_error, _token) => {
                if (_error) {
                    return reject(_error);
                };

                return resolve(_token);
            });
        });
    }

    async authenticateAdminByJWTToken (_token) {
        return new Promise((resolve, reject) => {
            jwt.verify(_token, ENV_VARIABLE_JWT_SECRET, (_error, _decoded) => {
                if (_error) {
                    return reject(_error);
                };

                return resolve(_decoded);
            });
        });
    }

    async addNewGroup (_name, _status) {
        return this.models.AuthGroup
            .query()
            .insert({
                name: _name,
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }

    async activateGroup (_name) {
        return this.models.AuthGroup
            .query()
            .update({ status: this.STATUS_ACTIVE })
            .where('name', _name);
    }

    async addNewResource (_type, _method, _status) {
        return this.models.AuthResource
            .query()
            .insert({
                type: this.typeEnumValidator.validate(_type),
                method: this.methodEnumValidator.validate(_method),
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }
}

module.exports = Authenticator;
