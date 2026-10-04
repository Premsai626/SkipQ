import React from 'react';
import { Eye, Clock, Printer, CheckCircle, FileText } from 'lucide-react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatRelativeTime } from '../../utils/formatting';

interface OrderCardMobileProps {
  order: Order;
  onSelect: (order: Order) => void;
  onQuickAction: (order: Order, e: React.MouseEvent) => void;
}

export const OrderCardMobile: React.FC<OrderCardMobileProps> = ({
  order,
  onSelect,
  onQuickAction,
}) => {
  const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

  return (
    <div
      onClick={() => onSelect(order)}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card hover:border-brand-200 transition-all cursor-pointer space-y-3"
    >
      {/* Top row: Token, Status, Relative time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-black text-slate-900">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {formatRelativeTime(order.createdAt)}
        </span>
      </div>

      {/* Student & Specs */}
      <div className="text-xs text-slate-600 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800">{order.studentName}</span>
          <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(order.pricing.total)}</span>
        </div>
        <p className="text-slate-500">
          {order.documents.length} files ({totalPages} pgs) • {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.copies} sets
        </p>
      </div>

      {/* Action Row */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-slate-400 font-medium">{order.pickupCounter}</span>

        <div className="flex items-center gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
            >
              Start Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
            >
              Mark Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100"
            title="Inspect"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
