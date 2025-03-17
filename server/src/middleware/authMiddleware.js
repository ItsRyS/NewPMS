const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" });
  }
};

module.exports = { verifyToken };
