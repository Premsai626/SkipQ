import { adminProvisionStaffSchema } from '../validators/index.js';
import { getUserRepository } from '../repositories/userRepository.js';

export class AdminController {
  /**
   * Provision a new Staff Member.
   * Restricted strictly to Authenticated + Active + Admin.
   * Endpoint: POST /api/v1/admin/staff
   */
  static async provisionStaff(req, res, next) {
    try {
      const data = adminProvisionStaffSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      const userRepo = getUserRepository();
      const existing = await userRepo.findByEmail(email);

      let staffUser;
      if (existing) {
        if (existing.role === 'admin') {
          return res.status(400).json({
            success: false,
            message: 'Cannot modify role of an existing administrator',
            timestamp: new Date().toISOString(),
          });
        }

        // Promote existing student to staff and activate
        const updateFields = {
          role: 'staff',
          status: 'active',
          name: data.name,
          department: data.department || existing.department,
          collegeId: data.collegeId || existing.collegeId,
          phone: data.phone || existing.phone,
        };

        if (data.password) {
          updateFields.passwordHash = await userRepo.hashPassword(data.password);
        }

        staffUser = await userRepo.update(existing.id, updateFields);
      } else {
        // Create new staff account
        const initialPassword = data.password || 'StaffTempPass@2026';
        staffUser = await userRepo.create({
          name: data.name,
          email,
          password: initialPassword,
          role: 'staff', // Always staff (never admin)
          status: 'active',
          department: data.department || 'Stationery Desk',
          collegeId: data.collegeId || 'STAFF-DESK',
          phone: data.phone || '',
        });
      }

      const { passwordHash, ...safeStaff } = staffUser;

      return res.status(201).json({
        success: true,
        data: safeStaff,
        message: `Staff member '${data.name}' (${email}) provisioned successfully with staff operational privileges`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deprovision a Staff Member.
   * Restricted strictly to Authenticated + Active + Admin.
   * Sets role = 'student' and status = 'active' so the user retains their
   * account, historical orders, and profile, but immediately loses staff privileges.
   * Endpoint: PATCH /api/v1/admin/staff/:userId/deactivate
   */
  static async deprovisionStaff(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID is required for deprovisioning',
          timestamp: new Date().toISOString(),
        });
      }

      // Check: Admin cannot deprovision themselves
      if (req.user.id === userId || req.user.sub === userId) {
        return res.status(400).json({
          success: false,
          message: 'Forbidden: Administrators cannot deprovision their own account',
          timestamp: new Date().toISOString(),
        });
      }

      const userRepo = getUserRepository();
      const targetUser = await userRepo.findById(userId);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: `User with ID '${userId}' not found`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check: Target must currently be staff
      if (targetUser.role !== 'staff') {
        return res.status(400).json({
          success: false,
          message: `Target user is not a staff member (current role: '${targetUser.role}')`,
          timestamp: new Date().toISOString(),
        });
      }

      // Deprovision staff: downgrade role to student, keep status active
      // Preserves all user profile information, document metadata, and historical orders!
      const updatedUser = await userRepo.update(userId, {
        role: 'student',
        status: 'active',
      });

      const { passwordHash, ...safeUser } = updatedUser;

      return res.json({
        success: true,
        data: safeUser,
        message: `Staff privileges revoked for '${updatedUser.name}'. Account remains active as a student.`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List all current staff members.
   * Endpoint: GET /api/v1/admin/staff
   */
  static async listStaff(req, res, next) {
    try {
      const userRepo = getUserRepository();
      const staffList = await userRepo.listStaff();

      return res.json({
        success: true,
        data: staffList,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
