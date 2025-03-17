const mysql = require("mysql2");
require("dotenv").config();

const ENV = process.env.NODE_ENV || "development";

const pool = mysql.createPool({
  host: ENV === "production" ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST,
  port: ENV === "production" ? Number(process.env.PROD_DB_PORT) : Number(process.env.DEV_DB_PORT),
  user: ENV === "production" ? process.env.PROD_DB_USER : process.env.DEV_DB_USER,
  password: ENV === "production" ? process.env.PROD_DB_PASSWORD : process.env.DEV_DB_PASSWORD,
  database: ENV === "production" ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

//  ตรวจสอบการเชื่อมต่อฐานข้อมูล
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(` Connected to database: ${process.env.PROD_DB_NAME} at ${process.env.PROD_DB_HOST}:${process.env.PROD_DB_PORT}`);
    connection.release();
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    reconnectDatabase();
  }
};

//  ฟังก์ชัน Reconnect กรณีฐานข้อมูลล่ม
const reconnectDatabase = () => {
  console.log(" Attempting to reconnect to database...");
  setTimeout(async () => {
    await checkConnection();
  }, 5000);
};

//  ตรวจสอบการเชื่อมต่อเมื่อเริ่มต้นเซิร์ฟเวอร์
checkConnection();

pool.on("error", (err) => {
  console.error(" Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    reconnectDatabase();
  } else {
    throw err;
  }
});

module.exports = pool;
