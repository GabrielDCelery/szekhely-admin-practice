'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_req, _res) => {
    _res.send('hello world');
});

app.get('/mockdata', (_req, _res) => {
    _res.json({ mockdata: 'foo' });
});

app.listen(3000);
