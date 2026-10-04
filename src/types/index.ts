export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'PAYMENT_VERIFIED'
  | 'PRINTING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'REJECTED'
  | 'CANCELLED';

export type PrintService = 'PRINT' | 'XEROX';
export type ColorMode = 'BW' | 'COLOR';
export type PaperSize = 'A4' | 'A3';
export type Sides = 'SINGLE' | 'DOUBLE';
export type FinishingOption = 'NONE' | 'STAPLE' | 'SPIRAL' | 'LAMINATION';
export type PaymentMethod = 'UPI' | 'CARD' | 'CASH';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  pages: number;
  url?: string;
  previewUrl?: string;
  uploadedAt: string;
}

export interface PrintConfiguration {
  service: PrintService;
  color: ColorMode;
  paperSize: PaperSize;
  sides: Sides;
  copies: number;
  finishing: FinishingOption;
  pageRange?: string;
  instructions?: string;
}

export interface PriceBreakdown {
  totalSheets: number;
  baseCost: number;
  colorSurcharge: number;
  paperSurcharge: number;
  duplexAdjustment: number;
  copies: number;
  finishingCost: number;
  total: number;
}

export interface Order {
  id: string;
  token: string; // e.g. "XR-1042"
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  documents: DocumentItem[];
  config: PrintConfiguration;
  pricing: PriceBreakdown;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  estimatedMinutes: number;
  queuePosition: number;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  pickupCounter: string;
  otpCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff';
  department?: string;
  collegeId?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  orderId: string;
  token: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface OperationalMetrics {
  pendingCount: number;
  printingCount: number;
  readyCount: number;
  completedTodayCount: number;
  todayRevenue: number;
  avgWaitMinutes: number;
  colorPercentage: number;
  topService: string;
}
