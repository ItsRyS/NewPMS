require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
<<<<<<< HEAD
  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
=======
>>>>>>> parent of 04e2890 (เชื่อม TiDB ได้แล้ว)
});

console.log('Connected to the database.'); // ใช้ข้อความ Log ธรรมดาแทน callback

module.exports = db.promise();
