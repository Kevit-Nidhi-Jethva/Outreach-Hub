const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure required fields exist
    if (!decoded.userId || !decoded.role || !decoded.workspaceId) {
      return res.status(400).json({ message: 'Token is missing essential user data.' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      workspaceId: decoded.workspaceId,
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
