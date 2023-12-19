/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const BCRYPT_WORK_FACTOR = 12;
const SECRET_KEY = process.env.SECRET_KEY;

if (process.env.NODE_ENV === 'test') {
  dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_TEST_NAME,
  };
} else {
  dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
  };
}

module.exports = {
  dbConfig,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};