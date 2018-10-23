'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { UniqueViolationError } = require('objection-db-errors');

class Admin {
    constructor (_models) {
        this.models = _models;
        this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE = 1;
    }

    _saltAndHashPassword (_password) {
        const _salt = crypto.randomBytes(32).toString('hex');

        return {
            salt: _salt,
            saltedAndHashedPassword: crypto.pbkdf2Sync(_password, _salt, 100000, 32, 'sha512').toString('hex')
        };
    }

    async addNew (_email, _password) {
        const { salt, saltedAndHashedPassword } = this._saltAndHashPassword(_password);

        try {
            return this.models.AuthAdmin
                .query()
                .insert({
                    email: _email,
                    password: saltedAndHashedPassword,
                    salt: salt,
                    status: this.STATUS_INACTIVE,
                    is_super: false
                });
        } catch (_error) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!')
            console.log(_error instanceof UniqueViolationError);
        }
    }

    async activate (_email) {

    }

    async validatePassword (_email, _password) {

    }

    async createJWTToken () {}

    async validateJWTToken (_token) {

    }
}

module.exports = Admin;
