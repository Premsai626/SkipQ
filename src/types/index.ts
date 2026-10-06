export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'PAYMENT_VERIFIED'
  | 'PRINTING'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'REJECTED'
  | 'DECLINED'
  | 'CANCELLED';

export type PrintService = 'PRINT' | 'XEROX';
export type ColorMode = 'BW' | 'COLOR';
export type PaperSize = 'A4' | 'A3';
export type Sides = 'SINGLE' | 'DOUBLE';
export type FinishingOption = 'NONE' | 'STAPLE' | 'SPIRAL' | 'LAMINATION';
export type PaymentMethod = 'UPI' | 'CARD' | 'CASH';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type OrderType = 'PRINT' | 'STORE';

export interface DocumentItem {
  id: string;
  name: string;
  filename?: string;
  size: number;
  type: string;
  pages: number;
  url?: string;
  previewUrl?: string;
  storagePath?: string;
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
  subtotal: number;
  total: number;
  estimatedMinutes: number;
}

export interface StoreOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  token: string; // e.g. "XR-1042"
  orderType?: OrderType;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  documents: DocumentItem[];
  config: PrintConfiguration;
  items?: StoreOrderItem[];
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
  status?: 'active' | 'deactivated';
  department?: string;
  collegeId?: string;
  phone?: string;
  institution?: string;
  yearOfStudy?: string;
  profilePhoto?: string;
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
