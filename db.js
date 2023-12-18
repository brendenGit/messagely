/** Database connection for messagely. */

const { Client } = require('pg');
const { dbConfig } = require('./config');

const db = new Client(dbConfig)
db.connect()

module.exports = db;