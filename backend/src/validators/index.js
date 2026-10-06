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
  type: z.enum([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ]),
  pages: z.number().int().min(1).max(1000),
  url: z.string().optional(),
});

export const storeOrderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  orderType: z.enum(['PRINT', 'STORE']).default('PRINT'),
  documents: z.array(documentItemSchema).optional(),
  config: printConfigSchema.optional(),
  items: z.array(storeOrderItemSchema).optional(),
  paymentMethod: z.enum(['ONLINE', 'CASH', 'UPI', 'CARD']),
  pickupCounter: z.string().optional(),
}).refine((data) => {
  if (data.orderType === 'STORE') {
    return Array.isArray(data.items) && data.items.length > 0;
  }
  return Array.isArray(data.documents) && data.documents.length > 0 && !!data.config;
}, {
  message: 'Print orders require documents and print configuration; Store orders require items',
  path: ['orderType'],
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
    'DECLINED',
    'CANCELLED',
  ]),
  rejectionReason: z.string().max(300).optional(),
}).refine((data) => {
  if ((data.status === 'REJECTED' || data.status === 'DECLINED') && (!data.rejectionReason || data.rejectionReason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is mandatory when declining an order',
  path: ['rejectionReason'],
});

// Authentication Schemas - Strict Two Roles (Student & Staff)
export const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'staff']).default('student'),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
  institution: z.string().optional(),
  yearOfStudy: z.string().optional(),
});

export const googleSyncSchema = z.object({
  supabaseToken: z.string().min(1, 'Supabase authentication token is mandatory'),
  role: z.enum(['student', 'staff']).optional(),
  name: z.string().optional(),
  email: z.string().optional(), // Accepted for compatibility, but never used as identity authority
  avatar: z.string().optional(),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
  institution: z.string().optional(),
  yearOfStudy: z.string().optional(),
});

// Profile Management Schemas - Disallows editing role, id, email, status
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  department: z.string().optional(),
  collegeId: z.string().optional(),
  phone: z.string().optional(),
  institution: z.string().optional(),
  yearOfStudy: z.string().optional(),
  profilePhoto: z.string().optional(),
});

// Store Item Management Schemas (Staff Only)
export const createStoreItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).default('Stationery'),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export const updateStoreItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
});
