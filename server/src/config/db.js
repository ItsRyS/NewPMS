const mysql = require("mysql2");

const ENV = process.env.NODE_ENV || "development";

// ✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล โดยใช้ process.env โดยตรง
const dbConfig = {
  host: process.env[ENV === "development" ? "DEV_DB_HOST" : "PROD_DB_HOST"],
  user: process.env[ENV === "development" ? "DEV_DB_USER" : "PROD_DB_USER"],
  password: process.env[ENV === "development" ? "DEV_DB_PASSWORD" : "PROD_DB_PASSWORD"],
  database: process.env[ENV === "development" ? "DEV_DB_NAME" : "PROD_DB_NAME"],
  port: process.env[ENV === "development" ? "DEV_DB_PORT" : "PROD_DB_PORT"],
  ssl: ENV === "production" ? { rejectUnauthorized: true } : false, // ใช้ SSL เฉพาะ Production
  waitForConnections: true,
  connectionLimit: 10, // จำกัดการเชื่อมต่อพร้อมกัน
  queueLimit: 0, // ไม่จำกัดจำนวนคิวรอ
};

// ✅ ใช้ Pool + Promise
const pool = mysql.createPool(dbConfig).promise();

// ✅ ตรวจสอบการเชื่อมต่อฐานข้อมูล
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    reconnectDatabase();
  }
};

// ✅ ฟังก์ชัน Reconnect กรณีฐานข้อมูลล่ม
const reconnectDatabase = () => {
  console.log("🔄 Attempting to reconnect to database...");
  setTimeout(async () => {
    await checkConnection();
  }, 5000);
};

// ✅ ตรวจสอบการเชื่อมต่อเมื่อเริ่มต้นเซิร์ฟเวอร์
checkConnection();

// ✅ จัดการข้อผิดพลาดของฐานข้อมูล
pool.on("error", (err) => {
  console.error("❌ Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    reconnectDatabase();
  } else {
    throw err;
  }
});

module.exports = pool;
