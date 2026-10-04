import React, { useState } from 'react';
import {
  Layers,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { OrderDetailsDrawer } from '../../components/staff/OrderDetailsDrawer';
import { RejectModal } from '../../components/staff/RejectModal';
import { formatCurrency, formatRelativeTime } from '../../utils/formatting';

interface StaffQueuePageProps {
  onNavigate: (path: string) => void;
}

export const StaffQueuePage: React.FC<StaffQueuePageProps> = ({ onNavigate }) => {
  const { orders, updateOrderStatus, verifyPayment, simulateQueueStep } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);

  // Group into 3 operational columns
  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PAYMENT_VERIFIED'
  );
  const printingOrders = orders.filter((o) => o.status === 'PRINTING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP');

  const handleAdvance = (order: Order) => {
    if (order.status === 'PENDING') {
      updateOrderStatus(order.id, 'ACCEPTED');
    } else if (order.status === 'ACCEPTED' && order.paymentStatus !== 'VERIFIED') {
      verifyPayment(order.id);
    } else if (order.status === 'PAYMENT_VERIFIED' || order.status === 'ACCEPTED') {
      updateOrderStatus(order.id, 'PRINTING');
    } else if (order.status === 'PRINTING') {
      updateOrderStatus(order.id, 'READY_FOR_PICKUP');
    } else if (order.status === 'READY_FOR_PICKUP') {
      updateOrderStatus(order.id, 'COLLECTED');
    }
  };

  const renderQueueCard = (order: Order, nextActionLabel: string, actionColor: string) => {
    const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

    return (
      <div
        key={order.id}
        onClick={() => setSelectedOrder(order)}
        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card hover:shadow-floating hover:border-brand-200 transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-black text-slate-900">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-900">{order.studentName}</p>
          <p className="text-slate-500 truncate">
            {order.documents[0]?.name || 'Document'} • {totalPages} pgs ({order.config.copies}x)
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{order.config.color} • {order.config.paperSize}</span>
            <span>•</span>
            <span>{order.config.finishing}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-900">
            {formatCurrency(order.pricing.total)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance(order);
            }}
            className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 ${actionColor}`}
          >
            <span>{nextActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Queue Control Board</h1>
            <Badge variant="live" label="LIVE" size="sm" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            1-click operational lane advancement for counter staff & operators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={simulateQueueStep}
            leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
          >
            Simulate 1-Step Advance
          </Button>
        </div>
      </div>

      {/* 3 Operational Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Incoming & Queue Prep */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">1. Queue Line (Pending)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {pendingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400">Queue line is clear</p>
            ) : (
              pendingOrders.map((ord) =>
                renderQueueCard(
                  ord,
                  ord.status === 'PENDING' ? 'Accept' : ord.paymentStatus !== 'VERIFIED' ? 'Verify Cash' : 'Print',
                  'bg-brand-600 hover:bg-brand-700'
                )
              )
            )}
          </div>
        </div>

        {/* Column 2: Currently Printing */}
        <div className="bg-sky-50/50 border border-sky-200 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">2. Printing Now</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-800 text-xs font-bold animate-pulse">
              {printingOrders.length} active
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {printingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400">No active print jobs</p>
            ) : (
              printingOrders.map((ord) =>
                renderQueueCard(ord, 'Mark Ready', 'bg-emerald-600 hover:bg-emerald-700')
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready at Counter */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">3. Ready for Pickup</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {readyOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-400">No orders awaiting collection</p>
            ) : (
              readyOrders.map((ord) =>
                renderQueueCard(ord, 'Collected', 'bg-slate-900 hover:bg-black')
              )
            )}
          </div>
        </div>
      </div>

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(id, status) => {
          updateOrderStatus(id, status);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, status });
          }
        }}
        onVerifyPayment={(id) => {
          verifyPayment(id);
          if (selectedOrder) {
            setSelectedOrder({ ...selectedOrder, paymentStatus: 'VERIFIED' });
          }
        }}
        onOpenRejectModal={(ord) => setRejectModalOrder(ord)}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!rejectModalOrder}
        order={rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        onConfirmReject={(orderId, reason) => {
          updateOrderStatus(orderId, 'REJECTED', reason);
          if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: 'REJECTED', rejectionReason: reason });
          }
        }}
      />
    </div>
  );
};
