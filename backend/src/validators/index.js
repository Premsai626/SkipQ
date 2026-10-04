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
  type: z.string().min(1),
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(['student', 'staff']).default('student'),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(['student', 'staff']).default('student'),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
});
