import { orderService } from '../services/orderService.js';
import { PricingService } from '../services/pricingService.js';
import { printConfigSchema, documentItemSchema } from '../validators/index.js';
import { z } from 'zod';

export class QueueController {
  static async getQueue(req, res, next) {
    try {
      const queue = await orderService.getQueue();
      res.json({
        success: true,
        data: queue,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export class AnalyticsController {
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
