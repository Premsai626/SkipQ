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
        label: 'Pending',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dotColor: 'bg-amber-500',
        description: 'Waiting for Xerox staff to review',
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dotColor: 'bg-blue-500',
        description: 'Approved by staff, in queue line',
      };
    case 'PAYMENT_VERIFIED':
      return {
        label: 'Payment Verified',
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        dotColor: 'bg-indigo-500',
        description: 'Payment cleared, ready for printing',
      };
    case 'PRINTING':
      return {
        label: 'Printing',
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-300',
        dotColor: 'bg-sky-500 animate-ping',
        description: 'Currently running on Xerox machine',
      };
    case 'READY_FOR_PICKUP':
      return {
        label: 'Ready for Pickup',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dotColor: 'bg-emerald-500',
        description: 'Available at counter for collection',
      };
    case 'COLLECTED':
      return {
        label: 'Collected',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dotColor: 'bg-slate-400',
        description: 'Picked up by student',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dotColor: 'bg-rose-500',
        description: 'Declined by Xerox staff',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        border: 'border-slate-200',
        dotColor: 'bg-slate-300',
        description: 'Cancelled by student',
      };
  }
}
