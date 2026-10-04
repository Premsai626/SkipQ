import { orderService } from '../services/orderService.js';
import { PricingService } from '../services/pricingService.js';
import { printConfigSchema, documentItemSchema } from '../validators/index.js';
import { z } from 'zod';

export class QueueController {
  /**
   * Get Live Campus Print Queue.
   * If viewed by a student, sensitive fields (OTP, document URLs, phone, email)
   * are strictly sanitized to protect privacy and counter pickup security.
   */
  static async getQueue(req, res, next) {
    try {
      const queue = await orderService.getQueue();
      const isStaffOrAdmin = req.user && (req.user.role === 'staff' || req.user.role === 'admin');

      const sanitizedQueue = queue.map((order) => {
        // Staff and Admin see all operational fields
        if (isStaffOrAdmin) {
          return order;
        }

        // Student's own order retains full fields
        if (order.studentId === req.user?.id) {
          return order;
        }

        // Other students see sanitized queue information (privacy protection)
        return {
          id: order.id,
          token: order.token,
          status: order.status,
          queuePosition: order.queuePosition,
          estimatedMinutes: order.estimatedMinutes,
          pickupCounter: order.pickupCounter,
          createdAt: order.createdAt,
          // Hide sensitive documents, OTP, phone, and email of other students
          documents: [],
          studentName: order.studentName ? `${order.studentName.charAt(0)}***` : 'Student',
        };
      });

      res.json({
        success: true,
        data: sanitizedQueue,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export class AnalyticsController {
  /**
   * Operational Analytics for Xerox Shop Operators and Campus Admin.
   * Protected: Staff and Admin only.
   */
  static async getMetrics(req, res, next) {
    try {
      const metrics = await orderService.getMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

const calculatePricingSchema = z.object({
  documents: z.array(documentItemSchema).min(1),
  config: printConfigSchema,
});

export class PricingController {
  static calculate(req, res, next) {
    try {
      const validated = calculatePricingSchema.parse(req.body);
      const pricing = PricingService.calculate(validated.documents, validated.config);

      res.json({
        success: true,
        data: pricing,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export class NotificationController {
  static async getAll(req, res, next) {
    try {
      // Students only view their own notifications
      const studentId = req.user?.role === 'student' ? req.user.id : undefined;
      const notifications = await orderService.getNotifications(studentId);
      res.json({
        success: true,
        data: notifications,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await orderService.markNotificationRead(id);
      res.json({
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
