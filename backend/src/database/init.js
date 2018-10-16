const { Model } = require('objection');
const Knex = require('knex');

const knex = Knex({
    client: 'mysql2',
    useNullAsDefault: true,
    connection: {
        filename: 'example.db'
    }
});

Model.knex(knex);

const Person = require('./models/Person');

console.log(Person);
