import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ตั้งค่า baseURL ให้ตรงกับ backend
  withCredentials: true, // ใช้ cookies ในการตรวจสอบ session
});

export default api;
