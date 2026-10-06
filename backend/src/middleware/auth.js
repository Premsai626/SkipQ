import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { getUserRepository } from '../repositories/userRepository.js';

/**
 * Mandatory JWT Authentication Middleware.
 * Strictly verifies the Bearer token and checks the user's authoritative
 * role and active account status in the database.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid Authorization header',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.sub || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token payload',
        timestamp: new Date().toISOString(),
      });
    }

    // Authoritative server-side role and account status lookup
    const userRepo = getUserRepository();
    const user = await userRepo.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User account not found or has been removed',
        timestamp: new Date().toISOString(),
      });
    }

    // Account status check: deactivated accounts are denied immediately
    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Your account has been deactivated. Please contact campus administration.',
        timestamp: new Date().toISOString(),
      });
    }

    // Attach trusted, authoritative user identity to request
    req.user = {
      id: user.id,
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Current authoritative role from DB (protects against stale JWT claims)
      status: user.status,
      department: user.department,
      collegeId: user.collegeId,
      phone: user.phone,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication token has expired. Please sign in again.',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid authentication token',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Role-Based Authorization Middleware.
 * Rejects requests if user does not possess one of the allowed roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] permissions. Current role is '${req.user.role}'`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}
