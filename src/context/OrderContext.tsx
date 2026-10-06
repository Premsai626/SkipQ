import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Order,
  OrderStatus,
  NotificationItem,
  OperationalMetrics,
  PrintConfiguration,
  DocumentItem,
  PaymentMethod,
} from '../types';
import {
  ordersApi,
  queueApi,
  analyticsApi,
  notificationsApi,
} from '../services/api';
import { useAuth } from './AuthContext';
import { soundFX } from '../utils/sound';

interface CreateOrderParams {
  documents: DocumentItem[];
  config: PrintConfiguration;
  paymentMethod: PaymentMethod;
  pickupCounter?: string;
}

interface OrderContextType {
  orders: Order[];
  notifications: NotificationItem[];
  activeOrder: Order | null;
  metrics: OperationalMetrics;
  isLoading: boolean;
  createOrder: (params: CreateOrderParams) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, rejectionReason?: string) => Promise<void>;
  verifyPayment: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  simulateQueueStep: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  getOrderById: (orderIdOrToken: string) => Promise<Order | undefined>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    pendingCount: 0,
    printingCount: 0,
    readyCount: 0,
    completedTodayCount: 0,
    todayRevenue: 0,
    avgWaitMinutes: 0,
    colorPercentage: 0,
    topService: 'None yet',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders, metrics, and notifications from real backend API
  const refreshOrders = useCallback(async () => {
    try {
      // If role is student, API will automatically isolate their orders
      const ordersData = await ordersApi.getAll();
      setOrders(ordersData);

      // Load analytics metrics only for staff
      if (role === 'staff') {
        try {
          const metricsData = await analyticsApi.getMetrics();
          setMetrics(metricsData);
        } catch (mErr) {
          console.warn('Analytics fetch error:', mErr);
        }
      }

      // Load notifications
      const notifsData = await notificationsApi.getAll();
      setNotifications(notifsData);
    } catch (err) {
      console.warn('Backend sync warning (using cached orders):', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & state reset on user change / logout
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setNotifications([]);
      setMetrics({
        pendingCount: 0,
        printingCount: 0,
        readyCount: 0,
        completedTodayCount: 0,
        todayRevenue: 0,
        avgWaitMinutes: 0,
        colorPercentage: 0,
        topService: 'None yet',
      });
      setIsLoading(false);
      return;
    }
    refreshOrders();
  }, [refreshOrders, user]);

  // Live polling every 5 seconds only when user is authenticated
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshOrders, user]);

  // Current active student order
  const activeOrder = orders.find(
    (o) =>
      o.status === 'PRINTING' ||
      o.status === 'READY_FOR_PICKUP' ||
      o.status === 'ACCEPTED' ||
      o.status === 'PAYMENT_VERIFIED' ||
      o.status === 'PENDING'
  ) || null;

  const createOrder = useCallback(
    async (params: CreateOrderParams): Promise<Order> => {
      setIsLoading(true);
      try {
        const created = await ordersApi.create({
          documents: params.documents,
          config: params.config,
          paymentMethod: params.paymentMethod,
          pickupCounter: params.pickupCounter,
        });

        soundFX.playSuccessChime();
        await refreshOrders();
        return created;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshOrders]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus, rejectionReason?: string) => {
      try {
        const updated = await ordersApi.updateStatus(orderId, newStatus, rejectionReason);
        if (newStatus === 'READY_FOR_PICKUP') {
          soundFX.playReadyAlert();
        } else {
          soundFX.playTap();
        }
        await refreshOrders();
      } catch (err) {
        console.error('Failed to update status:', err);
        throw err;
      }
    },
    [refreshOrders]
  );

  const verifyPayment = useCallback(
    async (orderId: string) => {
      try {
        await ordersApi.verifyPayment(orderId);
        soundFX.playTap();
        await refreshOrders();
      } catch (err) {
        console.error('Failed to verify payment:', err);
        throw err;
      }
    },
    [refreshOrders]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await ordersApi.cancel(orderId);
        soundFX.playTap();
        await refreshOrders();
      } catch (err) {
        console.error('Failed to cancel order:', err);
        throw err;
      }
    },
    [refreshOrders]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const simulateQueueStep = useCallback(async () => {
    const printing = orders.find((o) => o.status === 'PRINTING');
    if (printing) {
      await updateOrderStatus(printing.id, 'READY_FOR_PICKUP');
      return;
    }
    const verified = orders.find((o) => o.status === 'PAYMENT_VERIFIED' || o.status === 'ACCEPTED');
    if (verified) {
      await updateOrderStatus(verified.id, 'PRINTING');
      return;
    }
    const pending = orders.find((o) => o.status === 'PENDING');
    if (pending) {
      await updateOrderStatus(pending.id, 'ACCEPTED');
      return;
    }
    const ready = orders.find((o) => o.status === 'READY_FOR_PICKUP');
    if (ready) {
      await updateOrderStatus(ready.id, 'COLLECTED');
    }
  }, [orders, updateOrderStatus]);

  const getOrderById = useCallback(
    async (idOrToken: string): Promise<Order | undefined> => {
      try {
        return await ordersApi.getById(idOrToken);
      } catch {
        return orders.find(
          (o) => o.id === idOrToken || o.token.toLowerCase() === idOrToken.toLowerCase()
        );
      }
    },
    [orders]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        notifications,
        activeOrder,
        metrics,
        isLoading,
        createOrder,
        updateOrderStatus,
        verifyPayment,
        cancelOrder,
        markNotificationRead,
        markAllNotificationsRead,
        simulateQueueStep,
        refreshOrders,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
