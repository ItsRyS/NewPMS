require('dotenv').config();
const mysql = require('mysql2');

// ใช้ค่าตัวแปรฐานข้อมูลจาก Heroku โดยตรง
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 3306;

// ตรวจสอบค่าก่อนเชื่อมต่อ
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("❌ Database configuration is missing! Please check environment variables.");
  process.exit(1);
}

// สร้าง Connection Pool สำหรับ MySQL
const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ตรวจสอบการเชื่อมต่อ
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log(`✅ Connected to database: ${DB_HOST}:${DB_PORT}`);
  connection.release();
});

module.exports = db.promise();
