import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // เปลี่ยนเป็น URL ของ backend ของคุณ
});

export default api;
