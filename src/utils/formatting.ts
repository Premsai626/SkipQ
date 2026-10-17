import { OrderStatus } from '../types';

export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const now = new Date().getTime();
    const then = new Date(isoString).getTime();
    const diffMin = Math.round((now - then) / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  } catch {
    return '';
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  description: string;
}

export function getStatusStyle(status: OrderStatus): StatusStyle {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending Review',
        bg: 'bg-[#FBBF24]/15',
        text: 'text-[#FBBF24]',
        border: 'border-[#FBBF24]/30',
        dotColor: 'bg-[#FBBF24]',
        description: 'Waiting for Xerox staff to review',
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        bg: 'bg-[#00D4FF]/15',
        text: 'text-[#00D4FF]',
        border: 'border-[#00D4FF]/30',
        dotColor: 'bg-[#00D4FF]',
        description: 'Approved by staff, queued in line',
      };
    case 'PAYMENT_VERIFIED':
      return {
        label: 'Payment Verified',
        bg: 'bg-[#8B5CF6]/15',
        text: 'text-[#8B5CF6]',
        border: 'border-[#8B5CF6]/30',
        dotColor: 'bg-[#8B5CF6]',
        description: 'Payment cleared, ready for printing',
      };
    case 'PRINTING':
      return {
        label: 'Printing Live',
        bg: 'bg-[#00D4FF]/20',
        text: 'text-[#00D4FF]',
        border: 'border-[#00D4FF]/50',
        dotColor: 'bg-[#00D4FF] live-indicator-dot',
        description: 'Currently running on Xerox machine',
      };
    case 'READY_FOR_PICKUP':
      return {
        label: 'Ready for Pickup',
        bg: 'bg-[#34D399]/15',
        text: 'text-[#34D399]',
        border: 'border-[#34D399]/40',
        dotColor: 'bg-[#34D399]',
        description: 'Available at counter for collection',
      };
    case 'COLLECTED':
      return {
        label: 'Collected',
        bg: 'bg-[#1A2232]',
        text: 'text-[#9CA3AF]',
        border: 'border-[#273244]',
        dotColor: 'bg-[#9CA3AF]',
        description: 'Picked up by student',
      };
    case 'REJECTED':
    case 'DECLINED':
      return {
        label: 'Declined',
        bg: 'bg-[#FB7185]/15',
        text: 'text-[#FB7185]',
        border: 'border-[#FB7185]/30',
        dotColor: 'bg-[#FB7185]',
        description: 'Declined by Xerox staff',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-[#111827]',
        text: 'text-[#6B7280]',
        border: 'border-[#273244]',
        dotColor: 'bg-[#6B7280]',
        description: 'Cancelled by student',
      };
    default:
      return {
        label: 'Pending Review',
        bg: 'bg-[#FBBF24]/15',
        text: 'text-[#FBBF24]',
        border: 'border-[#FBBF24]/30',
        dotColor: 'bg-[#FBBF24]',
        description: 'Waiting for Xerox staff to review',
      };
  }
}
