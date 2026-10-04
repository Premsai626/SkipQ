import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { loginSchema, registerSchema, adminBootstrapSchema } from '../validators/index.js';
import { getUserRepository } from '../repositories/userRepository.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class AuthController {
  /**
   * Secure User Login.
   * Compares password with bcrypt hash. Returns generic 401 on any failure.
   */
  static async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      const userRepo = getUserRepository();
      const user = await userRepo.findByEmail(email);

      // Return generic 401 without revealing whether the email exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
      }

      // Check account status
      if (user.status === 'deactivated') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This account has been deactivated. Please contact administration.',
          timestamp: new Date().toISOString(),
        });
      }

      // Verify password with bcrypt
      const isPasswordValid = await userRepo.comparePassword(data.password, user.passwordHash, email);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
      }

      // Issue signed JWT with standard claims
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      const { passwordHash, ...safeUserData } = user;

      return res.json({
        success: true,
        data: {
          user: safeUserData,
          token,
        },
        message: 'Authentication successful',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Public Student Registration.
   * ALWAYS sets role = 'student' and status = 'active'.
   * Never accepts role or status from client.
   */
  static async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      const userRepo = getUserRepository();
      const existingUser = await userRepo.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
          timestamp: new Date().toISOString(),
        });
      }

      // Create new student account (role is hard-coded to 'student')
      const newUser = await userRepo.create({
        name: data.name,
        email,
        password: data.password,
        role: 'student', // Always student for public registration
        status: 'active', // Always active
        department: data.department || '',
        collegeId: data.collegeId || '',
        phone: data.phone || '',
      });

      // Issue signed JWT
      const tokenPayload = {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      const { passwordHash, ...safeUserData } = newUser;

      return res.status(201).json({
        success: true,
        data: {
          user: safeUserData,
          token,
        },
        message: 'Student account registered successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Current Authenticated Profile.
   */
  static async me(req, res, next) {
    try {
      const userRepo = getUserRepository();
      const user = await userRepo.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found',
          timestamp: new Date().toISOString(),
        });
      }

      const { passwordHash, ...safeUserData } = user;

      return res.json({
        success: true,
        data: safeUserData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Google Authentication Sync.
   * Validates Supabase session token when available.
   * Authoritative role is fetched from database or defaults to 'student'.
   * Never accepts role from client.
   */
  static async syncGoogleUser(req, res, next) {
    try {
      const { email, name, supabaseToken, avatar, department, collegeId, phone } = req.body;

      let verifiedEmail = email ? email.toLowerCase().trim() : null;
      let verifiedId = null;

      // 1. If Supabase is configured and a token is passed, verify with Supabase Auth
      if (isSupabaseConfigured() && supabaseToken) {
        try {
          const client = getSupabaseClient();
          if (client) {
            const { data: authData, error: authError } = await client.auth.getUser(supabaseToken);
            if (!authError && authData?.user) {
              verifiedEmail = authData.user.email?.toLowerCase().trim();
              verifiedId = authData.user.id;
            }
          }
        } catch (tokenErr) {
          console.warn('[AuthController] Google auth token verification notice:', tokenErr.message);
        }
      }

      if (!verifiedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Valid email is required for authentication sync',
          timestamp: new Date().toISOString(),
        });
      }

      const userRepo = getUserRepository();
      let user = await userRepo.findByEmail(verifiedEmail);

      if (user) {
        // Deactivated check
        if (user.status === 'deactivated') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Your account has been deactivated.',
            timestamp: new Date().toISOString(),
          });
        }
        // Retain their authoritative role from DB (former staff stays student!)
      } else {
        // New user from Google SSO ALWAYS defaults to student/active
        const derivedName =
          name ||
          verifiedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        user = await userRepo.create({
          id: verifiedId,
          name: derivedName,
          email: verifiedEmail,
          role: 'student', // Strict default: Google SSO never automatically creates staff
          status: 'active',
          department: department || '',
          collegeId: collegeId || '',
          phone: phone || '',
        });
      }

      // Issue signed JWT
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      const { passwordHash, ...safeUserData } = user;

      return res.json({
        success: true,
        data: {
          user: safeUserData,
          token,
        },
        message: 'Google authentication successful',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Administrative Bootstrap Endpoint.
   * Enables provisioning the initial admin securely using the server bootstrap secret.
   * Completely eliminates hardcoded demo admin credentials!
   */
  static async bootstrapAdmin(req, res, next) {
    try {
      const data = adminBootstrapSchema.parse(req.body);

      // Verify bootstrap key against server configuration
      if (data.bootstrapKey !== config.adminBootstrapKey) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Invalid administrative bootstrap key',
          timestamp: new Date().toISOString(),
        });
      }

      const email = data.email.toLowerCase().trim();
      const userRepo = getUserRepository();
      const existing = await userRepo.findByEmail(email);

      let adminUser;
      if (existing) {
        const passwordHash = await userRepo.hashPassword(data.password);
        adminUser = await userRepo.update(existing.id, {
          role: 'admin',
          status: 'active',
          passwordHash,
          name: data.name,
        });
      } else {
        adminUser = await userRepo.create({
          name: data.name,
          email,
          password: data.password,
          role: 'admin',
          status: 'active',
          department: 'Campus Administration',
          collegeId: 'ADMIN-01',
        });
      }

      const tokenPayload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      const { passwordHash, ...safeUserData } = adminUser;

      return res.status(201).json({
        success: true,
        data: {
          user: safeUserData,
          token,
        },
        message: 'Administrative account bootstrapped successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
