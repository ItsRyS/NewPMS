require('dotenv').config();
const mysql = require('mysql2');

// ตรวจสอบ Environment ที่ใช้งาน (Development หรือ Production)
const ENV = process.env.NODE_ENV || 'production';

const DB_HOST = ENV === 'development' ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST;
const DB_USER = ENV === 'development' ? process.env.DEV_DB_USER : process.env.PROD_DB_USER;
const DB_PASSWORD = ENV === 'development' ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD;
const DB_NAME = ENV === 'development' ? process.env.DEV_DB_NAME : process.env.PROD_DB_NAME;
const DB_PORT = ENV === 'development' ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT;

// ตรวจสอบค่าก่อนเชื่อมต่อ (ป้องกันปัญหา ENV ไม่โหลด)
console.log(`🌍 Running in ${ENV} mode`);
console.log(`🔗 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT} as ${DB_USER}`);

// สร้าง Connection Pool
const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10, // จำกัดจำนวน Connections ใน Pool
  queueLimit: 0
});

// ตรวจสอบการเชื่อมต่อ
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    connection.release();
  }
});

module.exports = db.promise();
