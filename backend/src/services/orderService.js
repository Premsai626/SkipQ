import { getOrderRepository } from '../repositories/orderRepository.js';
import { PricingService } from './pricingService.js';
import { SupabaseNotificationRepository } from '../repositories/supabaseNotificationRepository.js';
import { isSupabaseConfigured } from '../config/supabase.js';

// Valid status transitions map
const VALID_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PAYMENT_VERIFIED', 'PRINTING', 'REJECTED'],
  PAYMENT_VERIFIED: ['PRINTING', 'REJECTED'],
  PRINTING: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['COLLECTED'],
  COLLECTED: [],
  REJECTED: [],
  CANCELLED: [],
};

export class OrderService {
  constructor() {
    this.repository = getOrderRepository();
    this.supabaseNotifs = isSupabaseConfigured() ? new SupabaseNotificationRepository() : null;
    this.notifications = [];
  }

  async createOrder({ documents, config, paymentMethod, student, pickupCounter }) {
    // 1. Authoritative price calculation
    const pricing = PricingService.calculate(documents, config);

    // 2. Generate human-readable Token (e.g. XR-1001)
    const all = await this.repository.findMany({ limit: 100 });
    let maxNum = 1000;
    all.orders.forEach((o) => {
      const match = o.token?.match(/XR-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const token = `XR-${maxNum + 1}`;
    const orderId = `XF-2026-${String(maxNum + 1).padStart(5, '0')}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Initial Status is ALWAYS PENDING upon order placement
    // Payment status is PENDING until verified by staff / operator
    const status = 'PENDING';
    const paymentStatus = 'PENDING';

    const newOrder = {
      id: orderId,
      token,
      studentId: student?.id || student?.sub,
      studentName: student?.name || 'Student',
      studentEmail: student?.email,
      studentPhone: student?.phone || '',
      documents,
      config,
      pricing,
      status,
      paymentMethod,
      paymentStatus,
      estimatedMinutes: pricing.estimatedMinutes,
      queuePosition: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pickupCounter: pickupCounter || (config.paperSize === 'A3' ? 'Counter #3 (Plotter & A3)' : 'Counter #2 (Main Desk)'),
      otpCode,
    };

    const saved = await this.repository.create(newOrder);

    // Create notification for student
    await this.createNotification({
      orderId: saved.id,
      token: saved.token,
      studentId: saved.studentId,
      title: 'Order Placed Successfully',
      message: `Token ${saved.token} confirmed. Total amount: ₹${saved.pricing.total}. Awaiting shop confirmation.`,
      type: 'success',
    });

    return saved;
  }

  async getOrder(idOrToken) {
    return this.repository.findById(idOrToken);
  }

  async getOrders(filters) {
    return this.repository.findMany(filters);
  }

  async updateStatus(idOrToken, newStatus, rejectionReason) {
    const order = await this.repository.findById(idOrToken);
    if (!order) {
      const err = new Error(`Order '${idOrToken}' not found`);
      err.statusCode = 404;
      throw err;
    }

    // Validate state machine transition
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      const err = new Error(
        `Invalid status transition: Cannot change order from '${order.status}' to '${newStatus}'`
      );
      err.statusCode = 400;
      throw err;
    }

    const updateData = {
      status: newStatus,
      ...(rejectionReason ? { rejectionReason } : {}),
    };

    const updated = await this.repository.update(order.id, updateData);

    // Dispatch notification
    let title = `Status Updated: ${newStatus}`;
    let message = `Order ${order.token} is now ${newStatus}.`;
    let type = 'info';

    if (newStatus === 'ACCEPTED') {
      title = 'Order Accepted';
      message = `Your order ${order.token} has been accepted into queue.`;
    } else if (newStatus === 'PRINTING') {
      title = 'Printing Started';
      message = `Xerox machines are currently printing order ${order.token}.`;
    } else if (newStatus === 'READY_FOR_PICKUP') {
      title = '🎉 Ready for Pickup!';
      message = `Order ${order.token} is ready at ${order.pickupCounter}. OTP: ${order.otpCode}`;
      type = 'success';
    } else if (newStatus === 'COLLECTED') {
      title = 'Order Completed';
      message = `Thank you for collecting order ${order.token}!`;
      type = 'success';
    } else if (newStatus === 'REJECTED') {
      title = 'Order Declined';
      message = `Order ${order.token} was rejected: ${rejectionReason}`;
      type = 'error';
    }

    await this.createNotification({
      orderId: order.id,
      token: order.token,
      studentId: order.studentId,
      title,
      message,
      type,
    });

    return updated;
  }

  async verifyPayment(idOrToken) {
    const order = await this.repository.findById(idOrToken);
    if (!order) {
      const err = new Error(`Order '${idOrToken}' not found`);
      err.statusCode = 404;
      throw err;
    }

    // Verify payment and transition to ACCEPTED if PENDING
    const nextStatus = order.status === 'PENDING' ? 'ACCEPTED' : order.status;

    const updated = await this.repository.update(order.id, {
      paymentStatus: 'VERIFIED',
      status: nextStatus,
    });

    await this.createNotification({
      orderId: order.id,
      token: order.token,
      studentId: order.studentId,
      title: 'Payment Verified',
      message: `Payment for order ${order.token} has been verified by the desk operator.`,
      type: 'success',
    });

    return updated;
  }

  async cancelOrder(idOrToken, userId, userRole) {
    const order = await this.repository.findById(idOrToken);
    if (!order) {
      const err = new Error(`Order '${idOrToken}' not found`);
      err.statusCode = 404;
      throw err;
    }

    // If student is cancelling, verify ownership
    if (userRole === 'student' && order.studentId !== userId) {
      const err = new Error('Access denied: You can only cancel your own orders');
      err.statusCode = 403;
      throw err;
    }

    if (order.status !== 'PENDING') {
      const err = new Error('Only orders in PENDING status can be cancelled.');
      err.statusCode = 400;
      throw err;
    }

    return this.updateStatus(order.id, 'CANCELLED');
  }

  async getQueue() {
    return this.repository.getQueue();
  }

  async getMetrics() {
    return this.repository.getMetrics();
  }

  async createNotification({ orderId, token, studentId, title, message, type = 'info' }) {
    const notif = {
      id: `notif_${Date.now()}`,
      orderId,
      token,
      studentId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(notif);

    if (this.supabaseNotifs) {
      try {
        await this.supabaseNotifs.create({
          id: notif.id,
          orderId,
          token,
          studentId,
          title,
          message,
          type,
        });
      } catch (err) {
        console.warn('[OrderService] Could not persist notification to Supabase:', err.message);
      }
    }

    return notif;
  }

  async getNotifications(studentId) {
    if (this.supabaseNotifs) {
      try {
        const fromDb = await this.supabaseNotifs.getAll(studentId);
        if (fromDb && fromDb.length > 0) {
          return fromDb;
        }
      } catch (err) {
        console.warn('[OrderService] Error fetching notifications from Supabase:', err.message);
      }
    }
    if (studentId) {
      return this.notifications.filter((n) => !n.studentId || n.studentId === studentId);
    }
    return this.notifications;
  }

  async markNotificationRead(id) {
    if (this.supabaseNotifs) {
      try {
        await this.supabaseNotifs.markRead(id);
      } catch (err) {
        console.warn('[OrderService] Error marking notification read in Supabase:', err.message);
      }
    }
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
    return n;
  }
}

export const orderService = new OrderService();
