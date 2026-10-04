import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { AdminController } from '../controllers/adminController.js';
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

// 1. Health & Diagnostics (Public)
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

// 2. Authentication Routes
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/google-sync', AuthController.syncGoogleUser);
router.post('/auth/admin/bootstrap', AuthController.bootstrapAdmin);
router.get('/auth/me', authenticate, AuthController.me);

// 3. Admin Staff Management Routes (Authenticated + Active + Admin Only)
router.post('/admin/staff', authenticate, requireRole('admin'), AdminController.provisionStaff);
router.patch('/admin/staff/:userId/deactivate', authenticate, requireRole('admin'), AdminController.deprovisionStaff);
router.get('/admin/staff', authenticate, requireRole('admin'), AdminController.listStaff);

// 4. Documents Routes (Authenticated)
router.post(
  '/documents/upload',
  authenticate,
  uploadMiddleware.single('file'),
  DocumentController.uploadDocument
);
router.get('/documents/presigned-url', authenticate, DocumentController.getPresignedUrl);
router.get('/documents/file/:filename', authenticate, DocumentController.getFile);

// 5. Authoritative Pricing Calculator (Public/Student)
router.post('/pricing/calculate', PricingController.calculate);

// 6. Orders Routes
router.get('/orders', authenticate, OrderController.getAll);
router.post('/orders', authenticate, OrderController.create);
router.get('/orders/:id', authenticate, OrderController.getById);
router.post('/orders/:id/cancel', authenticate, OrderController.cancel);

// Operational Order State & Payment Actions (Staff & Admin Only)
router.patch('/orders/:id/status', authenticate, requireRole('staff', 'admin'), OrderController.updateStatus);
router.post('/orders/:id/verify-payment', authenticate, requireRole('staff', 'admin'), OrderController.verifyPayment);

// 7. Queue Route (Authenticated, sanitized for students)
router.get('/queue', authenticate, QueueController.getQueue);

// 8. Operational Analytics (Staff & Admin Only)
router.get('/analytics', authenticate, requireRole('staff', 'admin'), AnalyticsController.getMetrics);

// 9. Notifications Routes (Authenticated)
router.get('/notifications', authenticate, NotificationController.getAll);
router.patch('/notifications/:id/read', authenticate, NotificationController.markRead);

export default router;
