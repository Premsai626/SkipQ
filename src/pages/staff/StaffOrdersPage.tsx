import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { OrderRow } from '../../components/staff/OrderRow';
import { OrderCardMobile } from '../../components/staff/OrderCardMobile';
import { OrderDetailsDrawer } from '../../components/staff/OrderDetailsDrawer';
import { RejectModal } from '../../components/staff/RejectModal';
import { Button } from '../../components/ui/Button';

interface StaffOrdersPageProps {
  onNavigate: (path: string) => void;
}

export const StaffOrdersPage: React.FC<StaffOrdersPageProps> = ({ onNavigate }) => {
  const { orders, updateOrderStatus, verifyPayment } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.documents.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' ? true : ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleQuickAction = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Order Queue Management</h1>
          <p className="text-sm text-white/50 mt-0.5">
            Real-time incoming orders, print validation, and student collection processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/staff/queue')}
          >
            Switch to Queue Board
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by token (XR-1042), student name, or file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'PRINTING', label: 'Printing' },
            { id: 'READY_FOR_PICKUP', label: 'Ready' },
            { id: 'COLLECTED', label: 'Collected' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#CCFF00] text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table on Desktop, Cards on Mobile */}
      <div className="glass-card-dark border border-white/10 rounded-3xl shadow-xl overflow-hidden backdrop-blur-2xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2 text-[11px] font-extrabold uppercase tracking-wider text-white/40">
                <th className="py-3.5 px-4">Token</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Files & Pages</th>
                <th className="py-3.5 px-4">Configuration</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-white/40">
                    No orders matching the active criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onSelect={setSelectedOrder}
                    onQuickAction={handleQuickAction}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <p className="py-8 text-center text-xs text-white/40">
              No orders matching current filter.
            </p>
          ) : (
            filteredOrders.map((order) => (
              <OrderCardMobile
                key={order.id}
                order={order}
                onSelect={setSelectedOrder}
                onQuickAction={handleQuickAction}
              />
            ))
          )}
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
