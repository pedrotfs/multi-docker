const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express(); //receives http requests

app.use(cors()); //cross origin resource something
app.use(bodyParser.json());

const { Pool } = require('pg');
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    user: keys.pgUser,
    database: keys.pgDatabase,
    password: keys.pgPassword
});

pgClient.on('error', () => console.log('Connection to posgres lost.'));
pgClient.query('CREATE TABLE IF NOT EXISTS values(number INT)').catch(err => {
    console.log(err);
});

const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send('Connected.');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM VALUES');
    res.send(values.rows);
    console.log('values retrieved: ' + values.rowCount);
});

app.get('/values/currents', async (req, res) => {
    redisClient.hgetall('values', (err, values) => { //redis dont have promise suport otb
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if(parseInt(index) > 40) {
        return res.status(422).send('please use a index lower than 40.');
    }
    redisClient.hset('values', index, 'Nothing yet.');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) values($1)', [index]);
    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});