'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CustomDbError = require('../helpers/CustomDbError');
const EnvironmentVariables = require('../../helpers/EnvironmentVariables');
const ControllerEnumValidator = require('../helpers/ControllerEnumValidator');

const ENV_VARIABLE_JWT_SECRET = EnvironmentVariables.get('JWT_SECRET');

class Authenticator {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.STATUS_DISABLED = 2;
        this.METHOD_GET = 1;
        this.METHOD_POST = 2;
        this.ERROR_ACCOUNT_INACTIVE = 'Inactive user!';
        this.ERROR_ACCOUNT_LOCKED = 'Sorry, this account has been locked!';
        this.ERROR_PASSWORD_INVALID = 'Invalid password!';
        this.ERROR_ADMIN_RESOURCE_DOES_NOT_EXIST = 'Sorry, could not find valid resource for this admin!';
        this.JWT_EXPIRES_IN = 28800;
        this.MAX_FAILED_LOGIN_ATTEMPTS = 3;
        this.resourceTypeEnumValidator = new ControllerEnumValidator(this, 'TYPE');
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

    async changeAdminStatus (_email, _status) {
        return this.models.AuthAdmin
            .query()
            .update({ status: this.statusEnumValidator.validate(_status) })
            .where({ email: _email });
    }

    async authenticateAdminByEmailAndPassword (_email, _password) {
        const _admin = await this.models.AuthAdmin
            .query()
            .select('email', 'salt', 'password', 'num_of_failed_login_attempts', 'status')
            .where({ email: _email })
            .first();

        if (_admin.status === this.STATUS_INACTIVE) {
            throw new Error(this.ERROR_ACCOUNT_INACTIVE);
        }

        if (_admin.status === this.STATUS_DISABLED) {
            throw new Error(this.ERROR_ACCOUNT_LOCKED);
        }

        if (await this._saltAndHashPassword(_admin.salt, _password) === _admin.password) {
            return { email: _admin.email };
        }

        if ((_admin.num_of_failed_login_attempts + 1) === this.MAX_FAILED_LOGIN_ATTEMPTS) {
            await this.models.AuthAdmin
                .query()
                .update({
                    status: this.STATUS_DISABLED,
                    num_of_failed_login_attempts: _admin.num_of_failed_login_attempts + 1
                })
                .where({ email: _email });

            throw new Error(this.ERROR_ACCOUNT_LOCKED);
        }

        await this.models.AuthAdmin
            .query()
            .update({ num_of_failed_login_attempts: _admin.num_of_failed_login_attempts + 1 })
            .where({ email: _email });

        throw new Error(this.ERROR_PASSWORD_INVALID);
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

    async changeGroupStatus (_name, _status) {
        return this.models.AuthGroup
            .query()
            .update({ status: this.statusEnumValidator.validate(_status) })
            .where({ name: _name });
    }

    async associateAdminAndGroup (_adminEmail, _groupName) {
        const _admin = await this.models.AuthAdmin.query().findOne({ email: _adminEmail });
        const _group = await this.models.AuthGroup.query().findOne({ name: _groupName });

        return _admin.$relatedQuery('groups').relate(_group.id);
    }

    async addNewResource (_name, _method, _status) {
        return this.models.AuthResource
            .query()
            .insert({
                name: _name,
                method: this.methodEnumValidator.validate(_method),
                status: this.statusEnumValidator.validate(_status, true) || this.STATUS_INACTIVE
            })
            .catch(_error => {
                throw new CustomDbError(_error.message);
            });
    }

    async changeResourceStatus (_name, _method, _status) {
        return this.models.AuthResource
            .query()
            .update({ status: this.statusEnumValidator.validate(_status) })
            .where({
                name: _name,
                method: this.methodEnumValidator.validate(_method)
            });
    }

    async associateResourceAndGroup (_resourceName, _groupName) {
        const _resource = await this.models.AuthResource.query().findOne({ name: _resourceName });
        const _group = await this.models.AuthGroup.query().findOne({ name: _groupName });

        return _resource.$relatedQuery('groups').relate(_group.id);
    }

    async doesAdminHaveAccessToResource (_email, _resourceName, _resourceMethod) {
        const _resourceAssociations = await this.models.AuthAdmin
            .query()
            .join('auth_admins_groups', 'auth_admins.id', 'auth_admins_groups.admin_id')
            .join('auth_groups', 'auth_admins_groups.group_id', 'auth_groups.id')
            .join('auth_resources_groups', 'auth_resources_groups.group_id', 'auth_groups.id')
            .join('auth_resources', 'auth_resources_groups.resource_id', 'auth_resources.id')
            .select({
                email: `${this.models.AuthAdmin.tableName}.email`,
                adminStatus: `${this.models.AuthAdmin.tableName}.status`,
                groupStatus: `${this.models.AuthGroup.tableName}.status`,
                resourceName: `${this.models.AuthResource.tableName}.name`,
                resourceMethod: `${this.models.AuthResource.tableName}.method`,
                resourceStatus: `${this.models.AuthResource.tableName}.status`
            })
            .where({
                email: _email,
                resourceName: _resourceName,
                resourceMethod: this.methodEnumValidator.validate(_resourceMethod),
                adminStatus: this.STATUS_ACTIVE,
                groupStatus: this.STATUS_ACTIVE,
                resourceStatus: this.STATUS_ACTIVE
            });

        if (_resourceAssociations.length === 0) {
            throw new Error(this.ERROR_ADMIN_RESOURCE_DOES_NOT_EXIST);
        }

        return true;
    }
}

module.exports = Authenticator;
