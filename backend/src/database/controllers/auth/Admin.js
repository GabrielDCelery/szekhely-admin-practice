'use strict';

const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
const customErrors = require('../../../helpers/customErrors');

class Admin {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
        this.ERROR_STATUS_INACTIVE = 'Inactive user!';
        this.ERROR_PASSWORD_INVALID = 'Invalid password!';
    }

    _createSalt () {
        return crypto.randomBytes(32).toString('hex');
    }

    _saltAndHashPassword (_salt, _password) {
        return crypto.pbkdf2Sync(_password, _salt, 100000, 32, 'sha512').toString('hex');
    }

    async addNew (_email, _password) {
        const _salt = this._createSalt();
        const _saltedAndHashedPassword = this._saltAndHashPassword(_salt, _password);

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
            .select('salt', 'password', 'status')
            .where('email', _email)
            .first();

        if (_admin.status === this.STATUS_INACTIVE) {
            throw new Error(this.ERROR_STATUS_INACTIVE);
        }

        return this._saltAndHashPassword(_admin.salt, _password) === _admin.password;
    }

    async validateByJWTToken (_token) {

    }

    async createJWTToken () {}
}

module.exports = Admin;
