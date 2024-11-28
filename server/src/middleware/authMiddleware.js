const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: กรุณาเข้าสู่ระบบ' });
  }
};

module.exports = authenticateSession;
