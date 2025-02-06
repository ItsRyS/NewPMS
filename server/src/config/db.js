require('dotenv').config();
const mysql = require('mysql2');

// Check current environment
const ENV = process.env.NODE_ENV || 'development';
const DB_HOST = ENV === 'development' ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST;
const DB_USER = ENV === 'development' ? process.env.DEV_DB_USER : process.env.PROD_DB_USER;
const DB_PASSWORD = ENV === 'development' ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD;
const DB_NAME = ENV === 'development' ? process.env.DEV_DB_NAME : process.env.PROD_DB_NAME;
const DB_PORT = ENV === 'development' ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

console.log(`db.js say : Connected ${DB_NAME} at ${DB_HOST}:${DB_PORT}.`);

module.exports = db.promise();
