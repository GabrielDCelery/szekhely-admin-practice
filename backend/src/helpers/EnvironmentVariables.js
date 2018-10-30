'use strict';

class EnvironmentVariables {
    static get (_name) {
        if (!process.env[_name]) {
            throw new Error(`Missing environment variable -> ${_name}`);
        }

        return process.env[_name];
    }
}

module.exports = EnvironmentVariables;
