const mysql = require("mysql2");

const ENV = process.env.NODE_ENV || "development";

const dbConfig = {
  host: ENV === "development" ? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST,
  user: ENV === "development" ? process.env.DEV_DB_USER : process.env.PROD_DB_USER,
  password: ENV === "development" ? process.env.DEV_DB_PASSWORD : process.env.PROD_DB_PASSWORD,
  database: ENV === "development" ? process.env.DEV_DB_NAME : process.env.PROD_DB_NAME,
  port: ENV === "development" ? process.env.DEV_DB_PORT : process.env.PROD_DB_PORT,
  ssl: ENV === "production" ? { rejectUnauthorized: true } : false, // ใช้ SSL ใน production
};

const pool = mysql.createPool(dbConfig).promise();

pool.getConnection()
  .then(conn => {
    console.log(`✅ Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = pool;
