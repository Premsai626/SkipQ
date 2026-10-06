import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import {
  loginSchema,
  registerSchema,
  googleSyncSchema,
  updateProfileSchema,
} from '../validators/index.js';
import { getUserRepository } from '../repositories/userRepository.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class AuthController {
  /**
   * Secure User Login (Student & Staff).
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
   * Account Registration (Student or Staff).
   * The only valid roles are 'student' and 'staff'.
   * Rejects 'admin' or any unauthorized role.
   */
  static async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      // Strict role enforcement: Only student or staff
      if (req.body.role === 'admin' || (req.body.role && !['student', 'staff'].includes(req.body.role))) {
        return res.status(400).json({
          success: false,
          message: "Invalid role specified. Only 'student' and 'staff' roles are permitted.",
          timestamp: new Date().toISOString(),
        });
      }

      const assignedRole = data.role === 'staff' ? 'staff' : 'student';

      const userRepo = getUserRepository();
      const existingUser = await userRepo.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
          timestamp: new Date().toISOString(),
        });
      }

      const newUser = await userRepo.create({
        name: data.name,
        email,
        password: data.password,
        role: assignedRole,
        status: 'active',
        department: data.department || '',
        collegeId: data.collegeId || '',
        phone: data.phone || '',
        institution: data.institution || 'Campus',
        yearOfStudy: data.yearOfStudy || '',
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
        message: `${assignedRole === 'staff' ? 'Staff' : 'Student'} account registered successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Google Authentication Sync.
   * Cryptographically verifies Supabase session token.
   * Requires token — never trusts request-body email for identity.
   * For existing users, authoritative role from database is preserved.
   * For new users, role may only be 'student' or 'staff'.
   */
  static async syncGoogleUser(req, res, next) {
    try {
      const { supabaseToken, role, name, department, collegeId, phone, institution, yearOfStudy } = req.body;

      // 1. Role validation: role may ONLY be 'student' or 'staff'
      if (role === 'admin' || (role && !['student', 'staff'].includes(role))) {
        return res.status(400).json({
          success: false,
          message: "Forbidden role requested: 'admin' role does not exist.",
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Mandatory token check: reject if missing
      if (!supabaseToken || typeof supabaseToken !== 'string' || !supabaseToken.trim()) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Valid Supabase authentication token is mandatory for Google sync',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Cryptographic token verification via Supabase Auth
      const client = getSupabaseClient();
      if (!client) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Authentication service unavailable to verify token',
          timestamp: new Date().toISOString(),
        });
      }

      let verifiedEmail = null;
      let verifiedId = null;
      let authUserMetadata = {};

      try {
        const { data: authData, error: authError } = await client.auth.getUser(supabaseToken.trim());
        if (authError || !authData?.user || !authData.user.email) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid, forged, or expired Supabase authentication token',
            timestamp: new Date().toISOString(),
          });
        }
        verifiedEmail = authData.user.email.toLowerCase().trim();
        verifiedId = authData.user.id;
        authUserMetadata = authData.user.user_metadata || {};
      } catch (tokenErr) {
        return res.status(401).json({
          success: false,
          message: `Unauthorized: Token verification failed: ${tokenErr.message}`,
          timestamp: new Date().toISOString(),
        });
      }

      if (!verifiedEmail) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Could not derive verified email from authentication token',
          timestamp: new Date().toISOString(),
        });
      }

      // 3. Reject any attempt to request 'admin' role
      if (role === 'admin') {
        return res.status(400).json({
          success: false,
          message: "Forbidden role requested: 'admin' role does not exist.",
          timestamp: new Date().toISOString(),
        });
      }

      const userRepo = getUserRepository();
      let user = await userRepo.findByEmail(verifiedEmail);

      if (user) {
        // Deactivated check: preserve account status security
        if (user.status === 'deactivated') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Your account has been deactivated. Please contact administration.',
            timestamp: new Date().toISOString(),
          });
        }
        // IMPORTANT: Existing users retain their database-authoritative role!
        // Client-supplied role is completely ignored to prevent privilege escalation.
      } else {
        // New user onboarding: Role must only be 'student' or 'staff'
        const initialRole = role === 'staff' ? 'staff' : 'student';

        const derivedName =
          name ||
          authUserMetadata.full_name ||
          authUserMetadata.name ||
          verifiedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

        user = await userRepo.create({
          id: verifiedId,
          name: derivedName,
          email: verifiedEmail,
          role: initialRole,
          status: 'active',
          department: department || '',
          collegeId: collegeId || '',
          phone: phone || '',
          institution: institution || 'Campus',
          yearOfStudy: yearOfStudy || '',
        });
      }

      // 4. Issue signed application JWT with authoritative database claims
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
   * Get Profile by ID.
   * Strict privacy enforcement: A user can access ONLY their own profile.
   * Cross-user profile access is forbidden (403).
   */
  static async getProfileById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to access this private profile',
          timestamp: new Date().toISOString(),
        });
      }

      const userRepo = getUserRepository();
      const user = await userRepo.findById(id);

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
   * Update Profile of Authenticated User.
   * Editable fields: name, institution, department, yearOfStudy, phone, profilePhoto.
   * Never allows modifying id, email, role, or status.
   */
  static async updateProfile(req, res, next) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const userRepo = getUserRepository();

      const updated = await userRepo.update(req.user.id, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found',
          timestamp: new Date().toISOString(),
        });
      }

      const { passwordHash, ...safeUserData } = updated;

      return res.json({
        success: true,
        data: safeUserData,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
