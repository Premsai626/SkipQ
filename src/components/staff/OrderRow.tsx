import React from 'react';
import { Eye, CheckCircle, Printer, CreditCard } from 'lucide-react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatRelativeTime } from '../../utils/formatting';

interface OrderRowProps {
  order: Order;
  onSelect: (order: Order) => void;
  onQuickAction: (order: Order, e: React.MouseEvent) => void;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onSelect,
  onQuickAction,
}) => {
  const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

  return (
    <tr
      onClick={() => onSelect(order)}
      className="hover:bg-[#1A2232]/50 transition-colors cursor-pointer text-xs border-b border-[#273244]/50 group"
    >
      {/* Token */}
      <td className="py-3.5 px-4 font-mono font-bold text-[#F9FAFB] group-hover:text-[#00D4FF] transition-colors">
        {order.token}
      </td>

      {/* Student */}
      <td className="py-3.5 px-4">
        <p className="font-bold text-[#F9FAFB]">{order.studentName}</p>
        <p className="text-[11px] text-[#9CA3AF]">{order.studentEmail}</p>
      </td>

      {/* Documents */}
      <td className="py-3.5 px-4">
        <span className="font-semibold text-[#F9FAFB]/90">
          {order.documents.length} file{order.documents.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[#9CA3AF] block text-[11px]">
          {totalPages} pages • {order.config.copies} set{order.config.copies > 1 ? 's' : ''}
        </span>
      </td>

      {/* Configuration */}
      <td className="py-3.5 px-4">
        <span className="font-medium text-[#F9FAFB]/80">
          {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.paperSize}
        </span>
        <span className="text-[#9CA3AF] block text-[11px]">
          {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.finishing}
        </span>
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 font-bold text-[#00D4FF] font-mono">
        {formatCurrency(order.pricing.total)}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <Badge status={order.status} size="sm" />
      </td>

      {/* Created */}
      <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
        {formatRelativeTime(order.createdAt)}
      </td>

      {/* Action */}
      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#00D4FF] hover:bg-[#00b4d8] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer font-mono"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#34D399] hover:bg-[#2ecc71] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer font-mono"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#00D4FF] hover:bg-[#00b4d8] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer font-mono"
            >
              Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#34D399] hover:bg-[#2ecc71] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer font-mono"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#1A2232] hover:bg-[#202B3D] text-[#F9FAFB] border border-[#273244] font-bold text-xs transition-colors shadow-sm cursor-pointer font-mono"
            >
              Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#00D4FF] hover:bg-[#1A2232] transition-colors cursor-pointer"
            title="Inspect order"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
