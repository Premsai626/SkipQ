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
        bg: 'bg-amber-500/15',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
        description: 'Waiting for Xerox staff to review',
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        bg: 'bg-sky-500/15',
        text: 'text-sky-300',
        border: 'border-sky-500/30',
        dotColor: 'bg-sky-400',
        description: 'Approved by staff, queued in line',
      };
    case 'PAYMENT_VERIFIED':
      return {
        label: 'Payment Verified',
        bg: 'bg-indigo-500/15',
        text: 'text-indigo-300',
        border: 'border-indigo-500/30',
        dotColor: 'bg-indigo-400',
        description: 'Payment cleared, ready for printing',
      };
    case 'PRINTING':
      return {
        label: 'Printing Live',
        bg: 'bg-[#00F0FF]/15',
        text: 'text-[#00F0FF]',
        border: 'border-[#00F0FF]/40',
        dotColor: 'bg-[#00F0FF] animate-ping',
        description: 'Currently running on Xerox machine',
      };
    case 'READY_FOR_PICKUP':
      return {
        label: 'Ready for Pickup',
        bg: 'bg-[#CCFF00]/15',
        text: 'text-[#CCFF00]',
        border: 'border-[#CCFF00]/40',
        dotColor: 'bg-[#CCFF00]',
        description: 'Available at counter for collection',
      };
    case 'COLLECTED':
      return {
        label: 'Collected',
        bg: 'bg-white/5',
        text: 'text-white/60',
        border: 'border-white/10',
        dotColor: 'bg-white/40',
        description: 'Picked up by student',
      };
    case 'REJECTED':
    case 'DECLINED':
      return {
        label: 'Declined',
        bg: 'bg-rose-500/15',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dotColor: 'bg-rose-500',
        description: 'Declined by Xerox staff',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-white/5',
        text: 'text-white/40',
        border: 'border-white/10',
        dotColor: 'bg-white/30',
        description: 'Cancelled by student',
      };
    default:
      return {
        label: 'Pending Review',
        bg: 'bg-amber-500/15',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
        description: 'Waiting for Xerox staff to review',
      };
  }
}
