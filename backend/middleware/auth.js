import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agrivision-super-secret-key-2026';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
    }

    next();
  };
};
