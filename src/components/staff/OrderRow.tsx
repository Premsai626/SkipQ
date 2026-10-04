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
      className="hover:bg-slate-50/80 transition-colors cursor-pointer text-xs border-b border-slate-100 group"
    >
      {/* Token */}
      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
        {order.token}
      </td>

      {/* Student */}
      <td className="py-3.5 px-4">
        <p className="font-bold text-slate-800">{order.studentName}</p>
        <p className="text-[11px] text-slate-400">{order.studentEmail}</p>
      </td>

      {/* Documents */}
      <td className="py-3.5 px-4">
        <span className="font-semibold text-slate-700">
          {order.documents.length} file{order.documents.length !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-400 block text-[11px]">
          {totalPages} pages • {order.config.copies} set{order.config.copies > 1 ? 's' : ''}
        </span>
      </td>

      {/* Configuration */}
      <td className="py-3.5 px-4">
        <span className="font-medium text-slate-700">
          {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.paperSize}
        </span>
        <span className="text-slate-400 block text-[11px]">
          {order.config.sides === 'DOUBLE' ? 'Duplex' : 'Single'} • {order.config.finishing}
        </span>
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 font-bold text-slate-900">
        {formatCurrency(order.pricing.total)}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <Badge status={order.status} size="sm" />
      </td>

      {/* Created */}
      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
        {formatRelativeTime(order.createdAt)}
      </td>

      {/* Action */}
      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {order.status === 'PENDING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Accept
            </button>
          )}

          {order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Verify Cash
            </button>
          )}

          {(order.status === 'PAYMENT_VERIFIED' || (order.status === 'ACCEPTED' && order.paymentStatus === 'VERIFIED')) && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Print
            </button>
          )}

          {order.status === 'PRINTING' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Mark Ready
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <button
              onClick={(e) => onQuickAction(order, e)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              Collected
            </button>
          )}

          <button
            onClick={() => onSelect(order)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Inspect order"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
