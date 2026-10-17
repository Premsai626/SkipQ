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
      className="bg-[#111827] border border-[#273244] rounded-2xl p-4 shadow-xl hover:border-[#00D4FF]/40 transition-all cursor-pointer space-y-3"
    >
      {/* Top row: Token, Status, Relative time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-black text-[#F9FAFB]">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>
        <span className="text-[11px] text-[#6B7280] font-medium font-mono">
          {formatRelativeTime(order.createdAt)}
        </span>
      </div>

      {/* Student & Specs */}
      <div className="text-xs text-[#9CA3AF] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#F9FAFB]">{order.studentName}</span>
          <span className="font-extrabold text-[#00D4FF] font-mono text-sm">{formatCurrency(order.pricing.total)}</span>
        </div>
        <p className="text-[#9CA3AF]/70">
          {order.documents.length} files ({totalPages} pgs) • {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.copies} sets
        </p>
      </div>

      {/* Action Row */}
      <div className="pt-2 border-t border-[#273244] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-[#6B7280] font-medium">{order.pickupCounter}</span>

        <div className="flex items-center gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-[#00D4FF] text-black font-bold text-xs shadow-sm cursor-pointer font-mono"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-[#34D399] text-black font-bold text-xs shadow-sm cursor-pointer font-mono"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-[#00D4FF] text-black font-bold text-xs shadow-sm cursor-pointer font-mono"
            >
              Start Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-[#34D399] text-black font-bold text-xs shadow-sm cursor-pointer font-mono"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-3 py-1.5 rounded-xl bg-[#1A2232] text-[#F9FAFB] border border-[#273244] font-bold text-xs shadow-sm cursor-pointer font-mono"
            >
              Mark Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1.5 rounded-xl text-[#9CA3AF] hover:text-[#00D4FF] hover:bg-[#1A2232] transition-colors cursor-pointer"
            title="Inspect"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
