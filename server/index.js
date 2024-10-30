require("dotenv").config();
const express = require("express");
const cors = require("cors");
const projectRoutes = require("./src/routes/projects");
const app = express();
app.use(cors()); // เปิดการใช้งาน CORS สำหรับ frontend

app.use(express.json());
app.use("/api", projectRoutes); // เชื่อมต่อ route กับ path `/api`

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
