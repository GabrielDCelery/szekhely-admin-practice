'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const customErrors = require('../../../helpers/customErrors');

class Admin {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.ERROR_STATUS_INACTIVE = 'Inactive user!';
        this.ERROR_PASSWORD_INVALID = 'Invalid password!';
        this.JWT_EXPIRES_IN = 28800;
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

    async addNew (_email, _password) {
        const _salt = await this._createSalt();
        const _saltedAndHashedPassword = await this._saltAndHashPassword(_salt, _password);

        return this.models.AuthAdmin
            .query()
            .insert({
                email: _email,
                password: _saltedAndHashedPassword,
                salt: _salt,
                status: this.STATUS_INACTIVE,
                is_super: false
            })
            .catch(customErrors.errorHandlerWrapper('db'));
    }

    async activate (_email) {
        return this.models.AuthAdmin
            .query()
            .update({ status: this.STATUS_ACTIVE })
            .where('email', _email);
    }

    async authenticateByEmailAndPassword (_email, _password) {
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

    async createJWTToken (_email, _password) {
        const _admin = await this.authenticateByEmailAndPassword(_email, _password);

        return jwt.sign(_admin, 'somecert', {
            expiresIn: this.JWT_EXPIRES_IN
        });
    }

    async authenticateByJWTToken (_token) {

    }
}

module.exports = Admin;
