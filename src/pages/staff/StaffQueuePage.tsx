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
        className="bg-[#0D111B] border border-[#273244] rounded-2xl p-4 shadow-xl hover:border-[#00D4FF]/40 transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-black text-[#F9FAFB]">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>

        <div className="text-xs text-[#9CA3AF] space-y-1">
          <p className="font-bold text-[#F9FAFB]">{order.studentName}</p>
          <p className="text-[#9CA3AF] truncate">
            {order.documents[0]?.name || 'Document'} • {totalPages} pgs ({order.config.copies}x)
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <span>{order.config.color} • {order.config.paperSize}</span>
            <span>•</span>
            <span>{order.config.finishing}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#273244] flex items-center justify-between">
          <span className="font-black font-mono text-xs text-[#00D4FF]">
            {formatCurrency(order.pricing.total)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance(order);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center gap-1 cursor-pointer font-mono ${actionColor}`}
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
            <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight">Live Queue Control Board</h1>
            <Badge variant="live" label="LIVE" size="sm" />
          </div>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            1-click operational lane advancement for counter staff & operators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={simulateQueueStep}
            leftIcon={<Zap className="w-4 h-4 text-black" />}
          >
            Simulate 1-Step Advance
          </Button>
        </div>
      </div>

      {/* 3 Operational Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Incoming & Queue Prep */}
        <div className="bg-[#111827] border border-[#273244] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#273244]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="font-bold text-sm text-[#F9FAFB]">1. Queue Line (Pending)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold font-mono">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {pendingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#9CA3AF]/50">Queue line is clear</p>
            ) : (
              pendingOrders.map((ord) =>
                renderQueueCard(
                  ord,
                  ord.status === 'PENDING' ? 'Accept' : ord.paymentStatus !== 'VERIFIED' ? 'Verify Cash' : 'Print',
                  'bg-[#00D4FF] hover:bg-[#00b4d8] text-black font-bold'
                )
              )
            )}
          </div>
        </div>

        {/* Column 2: Currently Printing */}
        <div className="bg-[#111827] border border-[#00D4FF]/30 bg-[#00D4FF]/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#00D4FF]/20">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="font-bold text-sm text-[#F9FAFB]">2. Printing Now</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 text-xs font-bold font-mono animate-pulse">
              {printingOrders.length} active
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {printingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#9CA3AF]/50">No active print jobs</p>
            ) : (
              printingOrders.map((ord) =>
                renderQueueCard(ord, 'Mark Ready', 'bg-[#34D399] hover:bg-[#2ecc71] text-black font-bold')
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready at Counter */}
        <div className="bg-[#111827] border border-[#34D399]/30 bg-[#34D399]/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#34D399]/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <h3 className="font-bold text-sm text-[#F9FAFB]">3. Ready for Pickup</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 text-xs font-bold font-mono">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {readyOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#9CA3AF]/50">No orders awaiting collection</p>
            ) : (
              readyOrders.map((ord) =>
                renderQueueCard(ord, 'Collected', 'bg-[#1A2232] hover:bg-[#202B3D] text-[#F9FAFB] border border-[#273244]')
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
