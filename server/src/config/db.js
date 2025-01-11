require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: process.env.TIDB_CA_CERT, // โหลด Certificate จาก Environment Variable
  },
});

console.log('Connected to the TiDB Cloud database.');

module.exports = db.promise();
