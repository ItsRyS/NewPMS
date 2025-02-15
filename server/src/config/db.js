const mysql = require("mysql2");

// ✅ ตั้งค่าการเชื่อมต่อฐานข้อมูล

const dbConfig = {
  host: process.env.PROD_DB_HOST,
  user: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
  port: process.env.PROD_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
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
