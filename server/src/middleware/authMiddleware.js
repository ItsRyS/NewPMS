const authenticateSession = (req, res, next) => {
  const tabId = req.headers["x-tab-id"]; // รับ tabId จาก Header

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
      req.session.user = req.session.tabs[tabId]; // แนบข้อมูล user ไว้ใน request
      next();
  } else {
      res.status(401).json({ error: "Unauthorized: กรุณาเข้าสู่ระบบ" });
  }
};

const authenticateAndRefreshSession = (req, res, next) => {
  const tabId = req.headers["x-tab-id"]; // รับ tabId จาก Header

  if (req.session && req.session.tabs && req.session.tabs[tabId]) {
      req.session.touch(); // ต่ออายุ Session
      req.session.user = req.session.tabs[tabId]; // แนบข้อมูล user ไว้ใน request
      next();
  } else {
      res.status(401).json({ error: "Session expired, please login again" });
  }
};

module.exports = {
  authenticateSession,
  authenticateAndRefreshSession,
};
