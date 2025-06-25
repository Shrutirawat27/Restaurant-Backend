const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization']; // More reliable
  const token = authHeader && authHeader.split(' ')[1]; // Split 'Bearer TOKEN'
  // console.log("🔑 Received Token:", token);

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("✅ Token valid, Admin ID:", decoded.id);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};
