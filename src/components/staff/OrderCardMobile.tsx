import React from 'react';
import { Eye } from 'lucide-react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';
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
      className="bg-[#121821] border border-[#273244] rounded-xl p-3.5 hover:border-[#06D6F0]/40 transition-all cursor-pointer space-y-2.5"
    >
      {/* Top row: Token, Status, Relative time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[#F1F5F9]">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>
        <span className="text-[11px] text-[#94A3B8]/60 font-medium font-mono">
          {formatRelativeTime(order.createdAt)}
        </span>
      </div>

      {/* Student & Specs */}
      <div className="text-xs text-[#94A3B8] space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#F1F5F9]">{order.studentName}</span>
          <span className="font-bold text-[#06D6F0] font-mono text-xs">{formatCurrency(order.pricing.total)}</span>
        </div>
        <p className="text-[#94A3B8]/80 text-[11px]">
          {order.documents.length} files ({totalPages} pgs) • {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.copies} sets
        </p>
      </div>

      {/* Action Row */}
      <div className="pt-2 border-t border-[#273244] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-[#94A3B8]/60 font-medium">{order.pickupCounter}</span>

        <div className="flex items-center gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#06D6F0] text-black font-bold text-xs shadow-xs cursor-pointer font-mono"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#34D399] text-black font-bold text-xs shadow-xs cursor-pointer font-mono"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#06D6F0] text-black font-bold text-xs shadow-xs cursor-pointer font-mono"
            >
              Start Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#34D399] text-black font-bold text-xs shadow-xs cursor-pointer font-mono"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#18212C] text-[#F1F5F9] border border-[#273244] font-bold text-xs shadow-xs cursor-pointer font-mono"
            >
              Mark Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#06D6F0] hover:bg-[#18212C] transition-colors cursor-pointer"
            title="Inspect"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
