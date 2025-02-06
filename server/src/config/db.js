const mysql = require('mysql2');
require('dotenv').config();

const ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    port: process.env.DEV_DB_PORT
  },
  production: {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT,
    ssl: { rejectUnauthorized: true }  // ใช้ SSL
  }
};

const db = mysql.createPool(config[ENV]);

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    connection.release();
  }
});

module.exports = db.promise();
