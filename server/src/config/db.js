const mysql = require("mysql2");

const ENV = process.env.NODE_ENV || "development";

// ✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล
const dbConfig = {
  host: process.env[ENV === "development" ? "DEV_DB_HOST" : "PROD_DB_HOST"],
  user: process.env[ENV === "development" ? "DEV_DB_USER" : "PROD_DB_USER"],
  password: process.env[ENV === "development" ? "DEV_DB_PASSWORD" : "PROD_DB_PASSWORD"],
  database: process.env[ENV === "development" ? "DEV_DB_NAME" : "PROD_DB_NAME"],
  port: parseInt(process.env[ENV === "development" ? "DEV_DB_PORT" : "PROD_DB_PORT"], 10),
  ssl: ENV === "production" ? { rejectUnauthorized: false } : false, // ✅ TiDB ใช้ SSL แต่ไม่เซ็นรับรอง
  waitForConnections: true,
  connectionLimit: 10, // จำกัดการเชื่อมต่อพร้อมกัน
  queueLimit: 0,
  acquireTimeout: 10000, // ✅ กำหนด timeout
  debug: ENV === "development" // ✅ เปิด debug mode เฉพาะ dev
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
  pool.on("error", (err) => {
    console.error("❌ Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      reconnectDatabase();
    } else {
      throw err;
    }
  });
  checkConnection();
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
