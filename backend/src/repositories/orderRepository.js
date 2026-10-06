import { config } from '../config/index.js';
import { SupabaseOrderRepository } from './supabaseOrderRepository.js';
import { isSupabaseConfigured } from '../config/supabase.js';

export class LocalOrderRepository {
  constructor() {
    this.orders = [];
  }

  async create(order) {
    this.orders.unshift(order);
    this.recalculateQueuePositions();
    return order;
  }

  async findById(idOrToken) {
    if (!idOrToken) return null;
    const lower = idOrToken.toLowerCase();
    return this.orders.find(
      (o) => o.id === idOrToken || o.token.toLowerCase() === lower
    ) || null;
  }

  async findMany({ status, studentId, studentEmail, search, limit = 50, offset = 0 } = {}) {
    let result = [...this.orders];

    if (studentId || studentEmail) {
      result = result.filter(
        (o) =>
          (studentId && o.studentId === studentId) ||
          (studentEmail && o.studentEmail?.toLowerCase() === studentEmail.toLowerCase())
      );
    }

    if (status && status !== 'ALL') {
      result = result.filter((o) => o.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.token.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          o.documents?.some((d) => d.name.toLowerCase().includes(q)) ||
          o.items?.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    const total = result.length;
    const paginated = result.slice(offset, offset + limit);

    return {
      orders: paginated,
      total,
      limit,
      offset,
    };
  }

  async update(id, updateFields) {
    const idx = this.orders.findIndex(
      (o) => o.id === id || o.token.toLowerCase() === id.toLowerCase()
    );
    if (idx === -1) return null;

    this.orders[idx] = {
      ...this.orders[idx],
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };

    this.recalculateQueuePositions();
    return this.orders[idx];
  }

  async getQueue() {
    const active = this.orders.filter(
      (o) =>
        o.status === 'PENDING' ||
        o.status === 'ACCEPTED' ||
        o.status === 'PAYMENT_VERIFIED' ||
        o.status === 'PRINTING'
    );
    return active.sort((a, b) => a.queuePosition - b.queuePosition);
  }

  async getMetrics() {
    const pendingCount = this.orders.filter((o) => o.status === 'PENDING').length;
    const printingCount = this.orders.filter((o) => o.status === 'PRINTING').length;
    const readyCount = this.orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
    const completedCount = this.orders.filter((o) => o.status === 'COLLECTED').length;
    const totalRevenue = this.orders.reduce(
      (sum, o) => (o.status !== 'CANCELLED' && o.status !== 'REJECTED' ? sum + (Number(o.pricing?.total) || 0) : sum),
      0
    );

    const totalPrinted = this.orders.filter((o) => o.config?.color).length;
    const colorOrders = this.orders.filter((o) => o.config?.color === 'COLOR').length;
    const colorPercentage = totalPrinted > 0 ? Math.round((colorOrders / totalPrinted) * 100) : 0;

    return {
      pendingCount,
      printingCount,
      readyCount,
      completedTodayCount: completedCount,
      todayRevenue: totalRevenue,
      avgWaitMinutes: (pendingCount + printingCount) > 0 ? (pendingCount + printingCount) * 4 : 0,
      colorPercentage,
      topService: this.orders.length > 0 ? 'Standard Print & Xerox' : 'None yet',
    };
  }

  recalculateQueuePositions() {
    let position = 1;
    for (let i = this.orders.length - 1; i >= 0; i--) {
      const order = this.orders[i];
      if (
        order.status === 'PENDING' ||
        order.status === 'ACCEPTED' ||
        order.status === 'PAYMENT_VERIFIED' ||
        order.status === 'PRINTING'
      ) {
        order.queuePosition = position;
        order.estimatedMinutes = Math.max(3, (position - 1) * 4 + 3);
        position++;
      } else if (order.status === 'READY_FOR_PICKUP') {
        order.queuePosition = 0;
        order.estimatedMinutes = 0;
      }
    }
  }
}

// Singleton repository instance based on environment configuration
let instance = null;

export function getOrderRepository() {
  if (!instance) {
    if (config.databaseDriver === 'supabase' || isSupabaseConfigured()) {
      try {
        instance = new SupabaseOrderRepository();
        console.log('[Database] Using Supabase PostgreSQL Order Repository');
      } catch (err) {
        console.warn('[Database] Failed to initialize SupabaseOrderRepository, falling back to LocalOrderRepository:', err.message);
        instance = new LocalOrderRepository();
      }
    } else {
      console.log('[Database] Using Local In-Memory Order Repository');
      instance = new LocalOrderRepository();
    }
  }
  return instance;
}
