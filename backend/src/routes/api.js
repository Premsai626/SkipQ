import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { DocumentController } from '../controllers/documentController.js';
import { OrderController } from '../controllers/orderController.js';
import {
  QueueController,
  AnalyticsController,
  PricingController,
  NotificationController,
} from '../controllers/queueController.js';
import { uploadMiddleware } from '../services/storageService.js';
import { authenticate, requireRole } from '../middleware/auth.js';

import { config } from '../config/index.js';
import { isSupabaseConfigured, testSupabaseConnection } from '../config/supabase.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'xerox-flow-api',
    version: '1.0.0',
    databaseDriver: config.databaseDriver,
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Supabase Status & Connection Diagnostic
router.get('/supabase/status', async (req, res) => {
  try {
    const status = await testSupabaseConnection();
    res.json({
      success: true,
      data: {
        configured: isSupabaseConfigured(),
        databaseDriver: config.databaseDriver,
        storageDriver: config.storageDriver,
        supabaseUrl: config.supabaseUrl ? config.supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
        bucket: config.supabaseBucket,
        ...status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Authentication
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/google-sync', AuthController.syncGoogleUser);
router.get('/auth/me', authenticate, AuthController.me);


// Documents Upload
router.post(
  '/documents/upload',
  authenticate,
  uploadMiddleware.single('file'),
  DocumentController.uploadDocument
);
router.get('/documents/presigned-url', authenticate, DocumentController.getPresignedUrl);

// Authoritative Pricing Calculator
router.post('/pricing/calculate', PricingController.calculate);

// Orders
router.get('/orders', authenticate, OrderController.getAll);
router.post('/orders', authenticate, OrderController.create);
router.get('/orders/:id', authenticate, OrderController.getById);
router.patch('/orders/:id/status', authenticate, OrderController.updateStatus);
router.post('/orders/:id/verify-payment', authenticate, OrderController.verifyPayment);
router.post('/orders/:id/cancel', authenticate, OrderController.cancel);

// Queue
router.get('/queue', authenticate, QueueController.getQueue);

// Operational Analytics (Staff / Admin)
router.get('/analytics', authenticate, AnalyticsController.getMetrics);

// Notifications
router.get('/notifications', authenticate, NotificationController.getAll);
router.patch('/notifications/:id/read', authenticate, NotificationController.markRead);

export default router;
