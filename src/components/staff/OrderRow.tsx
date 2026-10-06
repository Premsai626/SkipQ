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
      className="hover:bg-white/5 transition-colors cursor-pointer text-xs border-b border-white/5 group"
    >
      {/* Token */}
      <td className="py-3.5 px-4 font-mono font-bold text-white group-hover:text-[#CCFF00] transition-colors">
        {order.token}
      </td>

      {/* Student */}
      <td className="py-3.5 px-4">
        <p className="font-bold text-white">{order.studentName}</p>
        <p className="text-[11px] text-white/40">{order.studentEmail}</p>
      </td>

      {/* Documents */}
      <td className="py-3.5 px-4">
        <span className="font-semibold text-white/90">
          {order.documents.length} file{order.documents.length !== 1 ? 's' : ''}
        </span>
        <span className="text-white/40 block text-[11px]">
          {totalPages} pages • {order.config.copies} set{order.config.copies > 1 ? 's' : ''}
        </span>
      </td>

      {/* Configuration */}
      <td className="py-3.5 px-4">
        <span className="font-medium text-white/80">
          {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.paperSize}
        </span>
        <span className="text-white/40 block text-[11px]">
          {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.finishing}
        </span>
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 font-bold text-[#CCFF00] font-mono">
        {formatCurrency(order.pricing.total)}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <Badge status={order.status} size="sm" />
      </td>

      {/* Created */}
      <td className="py-3.5 px-4 text-white/40 whitespace-nowrap">
        {formatRelativeTime(order.createdAt)}
      </td>

      {/* Action */}
      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-[#00F0FF] hover:bg-[#00d4e0] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Inspect order"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
