import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      return next();
    } catch (err) {
      // Invalid JWT
    }
  }

  // Fallback for development: Default to student Prem Sai if no token passed,
  // or allow role header for flexible testing
  const devRole = req.headers['x-dev-role'] || 'student';
  req.user = {
    id: devRole === 'staff' ? 'usr_staff_1' : 'usr_student_1',
    email: devRole === 'staff' ? 'desk.library@campus.edu' : 'prem.sai@campus.edu',
    name: devRole === 'staff' ? 'Ramesh Kumar (Operator)' : 'Prem Sai',
    role: devRole,
  };

  next();
}

export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires '${allowedRole}' permissions`,
      });
    }
    next();
  };
}
