import { orderService } from '../services/orderService.js';
import { createOrderSchema, updateStatusSchema } from '../validators/index.js';

export class OrderController {
  static async create(req, res, next) {
    try {
      const validated = createOrderSchema.parse(req.body);

      const order = await orderService.createOrder({
        documents: validated.documents,
        config: validated.config,
        paymentMethod: validated.paymentMethod,
        student: req.user,
        pickupCounter: validated.pickupCounter,
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully and entered into campus queue',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order '${id}' not found`,
        });
      }

      // Data isolation: Students can only view their own order
      if (req.user && req.user.role === 'student') {
        const orderStudentId = order.student?.id || order.studentId;
        const orderStudentEmail = order.student?.email || order.studentEmail;
        const isOwner =
          orderStudentId === req.user.id ||
          (orderStudentEmail && orderStudentEmail.toLowerCase() === req.user.email?.toLowerCase());

        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to view this order',
          });
        }
      }

      res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status, studentId, search, limit, offset } = req.query;

      // Data isolation: Students can strictly only view their own orders
      let effectiveStudentId = undefined;
      let effectiveStudentEmail = undefined;

      if (req.user && req.user.role === 'student') {
        effectiveStudentId = req.user.id;
        effectiveStudentEmail = req.user.email;
      } else if (studentId) {
        effectiveStudentId = studentId;
      }

      const result = await orderService.getOrders({
        status,
        studentId: effectiveStudentId,
        studentEmail: effectiveStudentEmail,
        search,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const validated = updateStatusSchema.parse(req.body);

      const updated = await orderService.updateStatus(
        id,
        validated.status,
        validated.rejectionReason
      );

      res.json({
        success: true,
        data: updated,
        message: `Order status updated to '${validated.status}'`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await orderService.verifyPayment(id);

      res.json({
        success: true,
        data: updated,
        message: 'Payment verified and confirmed by desk operator',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const cancelled = await orderService.cancelOrder(id, req.user?.id);

      res.json({
        success: true,
        data: cancelled,
        message: 'Order cancelled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
