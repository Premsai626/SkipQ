import React, { useState } from 'react';
import {
  Clock,
  Printer,
  CheckCircle2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { OrderDetailsDrawer } from '../../components/staff/OrderDetailsDrawer';
import { RejectModal } from '../../components/staff/RejectModal';
import { formatCurrency } from '../../utils/formatting';

interface StaffQueuePageProps {
  onNavigate?: (path: string) => void;
}

export const StaffQueuePage: React.FC<StaffQueuePageProps> = ({ onNavigate: _onNavigate }) => {
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
        className="bg-[#18212C] border border-[#273244] rounded-xl p-3.5 hover:border-[#06D6F0]/40 transition-all cursor-pointer space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-[#F1F5F9]">
            {order.token}
          </span>
          <Badge status={order.status} size="sm" />
        </div>

        <div className="text-xs text-[#94A3B8] space-y-0.5">
          <p className="font-bold text-[#F1F5F9]">{order.studentName}</p>
          <p className="text-[#94A3B8] truncate">
            {order.documents[0]?.name || 'Document'} • {totalPages} pgs ({order.config.copies}x)
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]/60">
            <span>{order.config.color} • {order.config.paperSize}</span>
            <span>•</span>
            <span>{order.config.finishing}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#273244] flex items-center justify-between">
          <span className="font-bold font-mono text-xs text-[#06D6F0]">
            {formatCurrency(order.pricing.total)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance(order);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer font-mono ${actionColor}`}
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Live Queue Control Board</h1>
            <Badge variant="live" label="LIVE" size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Column 1: Incoming & Queue Prep */}
        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#273244]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="font-bold text-sm text-[#F1F5F9]">1. Queue Line (Pending)</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold font-mono">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[250px]">
            {pendingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#94A3B8]/50">Queue line is clear</p>
            ) : (
              pendingOrders.map((ord) =>
                renderQueueCard(
                  ord,
                  ord.status === 'PENDING' ? 'Accept' : ord.paymentStatus !== 'VERIFIED' ? 'Verify Cash' : 'Print',
                  'bg-[#06D6F0] hover:bg-[#06D6F0]/90 text-black font-bold'
                )
              )
            )}
          </div>
        </div>

        {/* Column 2: Currently Printing */}
        <div className="bg-[#121821] border border-[#06D6F0]/30 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#06D6F0]/20">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#06D6F0]" />
              <h3 className="font-bold text-sm text-[#F1F5F9]">2. Printing Now</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#06D6F0]/20 text-[#06D6F0] border border-[#06D6F0]/30 text-xs font-bold font-mono">
              {printingOrders.length} active
            </span>
          </div>

          <div className="space-y-2.5 min-h-[250px]">
            {printingOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#94A3B8]/50">No active print jobs</p>
            ) : (
              printingOrders.map((ord) =>
                renderQueueCard(ord, 'Mark Ready', 'bg-[#34D399] hover:bg-[#34D399]/90 text-black font-bold')
              )
            )}
          </div>
        </div>

        {/* Column 3: Ready at Counter */}
        <div className="bg-[#121821] border border-[#34D399]/30 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#34D399]/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <h3 className="font-bold text-sm text-[#F1F5F9]">3. Ready for Pickup</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 text-xs font-bold font-mono">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-2.5 min-h-[250px]">
            {readyOrders.length === 0 ? (
              <p className="text-center py-12 text-xs text-[#94A3B8]/50">No orders awaiting collection</p>
            ) : (
              readyOrders.map((ord) =>
                renderQueueCard(ord, 'Collected', 'bg-[#18212C] hover:bg-[#202B3D] text-[#F1F5F9] border border-[#273244]')
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
