import { z } from 'zod';

export const printConfigSchema = z.object({
  service: z.enum(['PRINT', 'XEROX']),
  color: z.enum(['BW', 'COLOR']),
  paperSize: z.enum(['A4', 'A3']),
  sides: z.enum(['SINGLE', 'DOUBLE']),
  copies: z.number().int().min(1).max(100),
  finishing: z.enum(['NONE', 'STAPLE', 'SPIRAL', 'LAMINATION']),
  instructions: z.string().max(500).optional(),
});

export const documentItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().positive(),
  type: z.enum(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']),
  pages: z.number().int().min(1).max(1000),
  url: z.string().optional(),
});

export const createOrderSchema = z.object({
  documents: z.array(documentItemSchema).min(1, 'At least one document is required'),
  config: printConfigSchema,
  paymentMethod: z.enum(['UPI', 'CARD', 'CASH']),
  pickupCounter: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'ACCEPTED',
    'PAYMENT_VERIFIED',
    'PRINTING',
    'READY_FOR_PICKUP',
    'COLLECTED',
    'REJECTED',
    'CANCELLED',
  ]),
  rejectionReason: z.string().max(300).optional(),
}).refine((data) => {
  if (data.status === 'REJECTED' && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is mandatory when declining an order',
  path: ['rejectionReason'],
});

// Authentication Schemas - Strict, No Self-Assignment of Roles
export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
});

// Admin Provisioning Schemas
export const adminBootstrapSchema = z.object({
  bootstrapKey: z.string().min(8, 'Bootstrap key must be provided'),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const adminProvisionStaffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
});
