import React from 'react';
import {
  Plus,
  Clock,
  History,
  Bell,
  ArrowRight,
  FileText,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatting';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { activeOrder, orders, notifications } = useOrders();

  const myOrders = orders.filter(
    (o) => o.studentId === user?.id || o.studentId === 'usr_student_1' || o.id === activeOrder?.id
  );
  const recentOrders = myOrders.slice(0, 4);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight break-words">
            Good day, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Manage your printing and orders.
          </p>
        </div>

        {/* Desktop "+ New Print Order" button */}
        <Button
          onClick={() => onNavigate('/student/orders/new')}
          size="md"
          variant="primary"
          className="hidden sm:inline-flex shrink-0 font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Print Order
        </Button>
      </div>

      {/* 2. Mobile Primary "+ New Print Order" Button (100% width on mobile) */}
      <div className="sm:hidden">
        <Button
          onClick={() => onNavigate('/student/orders/new')}
          size="lg"
          variant="primary"
          className="w-full h-12 text-sm font-bold shadow-md"
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          New Print Order
        </Button>
      </div>

      {/* 3. Active Order Spotlight Card (When active) */}
      {activeOrder && (
        <div className="bg-[#121821] rounded-2xl p-4 sm:p-5 border border-[#273244] shadow-md space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
              Active Queue Token
            </span>
            <Badge status={activeOrder.status} size="sm" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-mono text-3xl sm:text-4xl font-black text-[#F1F5F9] tracking-tight">
                  {activeOrder.token}
                </h2>
                <span className="text-xs text-[#94A3B8]">
                  ({activeOrder.documents.length} file{activeOrder.documents.length !== 1 ? 's' : ''} •{' '}
                  {activeOrder.config.color === 'COLOR' ? 'Color' : 'B&W'})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#94A3B8] mt-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#06D6F0] live-indicator-dot shrink-0" />
                  <span className="text-[#F1F5F9] font-medium">
                    {activeOrder.queuePosition > 1
                      ? `${activeOrder.queuePosition - 1} ahead in line`
                      : 'Next on Xerox printer'}
                  </span>
                </span>
                <span className="text-[#273244]">•</span>
                <span className="flex items-center gap-1 text-[#06D6F0] font-semibold">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  ~{activeOrder.estimatedMinutes}m turnaround
                </span>
              </div>
            </div>

            <Button
              onClick={() => onNavigate(`/student/orders/${activeOrder.id}/tracking`)}
              size="sm"
              variant="secondary"
              className="w-full sm:w-auto shrink-0 font-semibold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Track Live Queue
            </Button>
          </div>
        </div>
      )}

      {/* 4. Your Activity / Summary Chips */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
          Your Activity
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              if (activeOrder) {
                onNavigate(`/student/orders/${activeOrder.id}/tracking`);
              } else {
                onNavigate('/student/history');
              }
            }}
            className="p-3.5 rounded-2xl bg-[#121821] border border-[#273244] hover:border-[#06D6F0]/40 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Active Orders</span>
              <span className="w-2 h-2 rounded-full bg-[#06D6F0] group-hover:scale-125 transition-transform" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#F1F5F9] mt-1 font-mono">
              {activeOrder ? 1 : 0}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/student/history')}
            className="p-3.5 rounded-2xl bg-[#121821] border border-[#273244] hover:border-[#06D6F0]/40 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Past Orders</span>
              <History className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#06D6F0] transition-colors" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#F1F5F9] mt-1 font-mono">
              {myOrders.length}
            </p>
          </button>
        </div>
      </div>

      {/* 5. Quick Access Rows */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
          Quick Access
        </h2>
        <div className="bg-[#121821] rounded-2xl border border-[#273244] divide-y divide-[#273244]/60 overflow-hidden shadow-sm">
          {/* Print History Row */}
          <button
            type="button"
            onClick={() => onNavigate('/student/history')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#18212C] transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#18212C] border border-[#273244] flex items-center justify-center text-[#06D6F0] shrink-0 group-hover:scale-105 transition-transform">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F1F5F9] truncate">Print History</p>
                <p className="text-xs text-[#94A3B8] truncate">View past receipts and reorder files</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-[#94A3B8] bg-[#18212C] px-2 py-0.5 rounded-full border border-[#273244]">
                {myOrders.length} orders
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#06D6F0] group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Stationery Store Row */}
          <button
            type="button"
            onClick={() => onNavigate('/student/store')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#18212C] transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#18212C] border border-[#273244] flex items-center justify-center text-[#8B5CF6] shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F1F5F9] truncate">Stationery Store</p>
                <p className="text-xs text-[#94A3B8] truncate">Lab records, exam pens, binders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
                In Stock
              </span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#06D6F0] group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Notifications Row */}
          <button
            type="button"
            onClick={() => onNavigate('/student/notifications')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#18212C] transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#18212C] border border-[#273244] flex items-center justify-center text-[#34D399] shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F1F5F9] truncate">Notifications</p>
                <p className="text-xs text-[#94A3B8] truncate">Instant alerts when printing begins</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {unreadNotifications > 0 ? (
                <span className="text-[11px] font-mono text-[#F87171] bg-[#F87171]/10 px-2 py-0.5 rounded-full border border-[#F87171]/20 font-bold">
                  {unreadNotifications} new
                </span>
              ) : (
                <span className="text-[11px] font-mono text-[#94A3B8]">0 unread</span>
              )}
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#06D6F0] group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        </div>
      </div>

      {/* 6. Recent Activity Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
            Recent Activity
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/student/history')}
            className="text-xs font-semibold text-[#06D6F0] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-[#121821] rounded-2xl p-6 sm:p-8 text-center text-[#94A3B8] space-y-3 border border-[#273244]">
            <div className="w-10 h-10 rounded-xl bg-[#18212C] border border-[#273244] flex items-center justify-center text-[#94A3B8] mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F1F5F9]">No orders placed yet</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Upload your document to generate a 4-digit queue token.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNavigate('/student/orders/new')}
            >
              Start First Order
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onNavigate(`/student/orders/${order.id}/tracking`)}
                className="bg-[#121821] rounded-2xl p-3.5 sm:p-4 border border-[#273244] hover:border-[#06D6F0]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#18212C] border border-[#273244] group-hover:bg-[#06D6F0]/15 group-hover:text-[#06D6F0] text-[#94A3B8] flex items-center justify-center shrink-0 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#F1F5F9] text-sm">
                        {order.token}
                      </span>
                      <Badge status={order.status} size="sm" />
                    </div>
                    <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                      {order.documents[0]?.name || 'Document'} • {order.documents.length} file{order.documents.length > 1 ? 's' : ''} • {formatCurrency(order.pricing.total)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[#6B7280] hidden sm:inline font-mono">
                    {formatDate(order.createdAt)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#06D6F0] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentDashboard;
