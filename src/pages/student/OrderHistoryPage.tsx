import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  RotateCcw,
  ExternalLink,
  Download,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface OrderHistoryPageProps {
  onNavigate: (path: string) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate }) => {
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.documents.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? ord.status === 'PENDING' || ord.status === 'ACCEPTED' || ord.status === 'PAYMENT_VERIFIED' || ord.status === 'PRINTING' || ord.status === 'READY_FOR_PICKUP'
        : ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track all past printouts, reorder frequently used materials, or view digital receipts.
          </p>
        </div>

        <Button onClick={() => onNavigate('/student/orders/new')}>+ New Order</Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by token (XR-1042) or document name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'In Queue' },
            { id: 'READY_FOR_PICKUP', label: 'Ready' },
            { id: 'COLLECTED', label: 'Collected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-brand-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <p className="text-sm font-bold text-slate-700">No matching orders found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or filter tags.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-card hover:border-brand-200 hover:shadow-floating transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-mono font-black text-sm shrink-0">
                    XR
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-extrabold text-slate-900">
                        {order.token}
                      </span>
                      <Badge status={order.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600">
                      {order.documents[0]?.name || 'Document'} {order.documents.length > 1 ? `+ ${order.documents.length - 1} more` : ''} • {totalPages} pages • {order.config.color === 'COLOR' ? 'Color' : 'B&W'} • {order.config.copies} sets
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span>{order.pickupCounter}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="font-extrabold text-base text-slate-900">
                      {formatCurrency(order.pricing.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReceipt(order)}
                    >
                      Receipt
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onNavigate(`/student/orders/${order.id}/tracking`)}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Track
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Campus Receipt: ${selectedReceipt.token}`}
          description={`Order reference #${selectedReceipt.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">{selectedReceipt.studentName}</p>
                <p className="text-slate-400">{selectedReceipt.studentEmail}</p>
              </div>
              <Badge status={selectedReceipt.status} size="sm" />
            </div>

            <div className="space-y-2 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold">{selectedReceipt.config.service}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Specs:</span>
                <span className="font-semibold">
                  {selectedReceipt.config.color} • {selectedReceipt.config.paperSize} • {selectedReceipt.config.sides}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Finishing:</span>
                <span className="font-semibold">{selectedReceipt.config.finishing}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-emerald-700">
                  {selectedReceipt.paymentMethod} (Verified)
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-slate-900">{formatCurrency(selectedReceipt.pricing.total)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert(`Downloaded PDF receipt for ${selectedReceipt.token}`);
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Receipt PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
