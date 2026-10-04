import React from 'react';
import {
  PlusCircle,
  Clock,
  History,
  Bell,
  ArrowRight,
  FileText,
  CheckCircle2,
  Sparkles,
  Printer,
  ChevronRight,
  Zap,
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
  const { activeOrder, orders } = useOrders();

  const myOrders = orders.filter((o) => o.studentId === 'usr_student_1' || o.id === activeOrder?.id);
  const recentOrders = myOrders.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Student Print Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, {user?.name || 'Prem'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your printing queue is moving smoothly. What would you like to print today?
          </p>
        </div>

        <Button
          onClick={() => onNavigate('/student/orders/new')}
          size="lg"
          className="shadow-md shadow-brand-500/25 shrink-0"
          leftIcon={<PlusCircle className="w-5 h-5" />}
        >
          + New Order
        </Button>
      </div>

      {/* Active Order Spotlight Hero Card (Specification 12) */}
      {activeOrder && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl blur-sm opacity-30 group-hover:opacity-40 transition" />
          <div className="relative bg-white border border-brand-200/90 rounded-3xl p-6 sm:p-7 shadow-floating">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Queue Order
                  </span>
                  <Badge status={activeOrder.status} size="md" />
                </div>

                <div className="flex items-baseline gap-3">
                  <h2 className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                    {activeOrder.token}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    ({activeOrder.documents.length} file{activeOrder.documents.length !== 1 ? 's' : ''} • {activeOrder.config.color === 'COLOR' ? 'Color' : 'B&W'})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-dot" />
                    <strong>{activeOrder.queuePosition > 1 ? `${activeOrder.queuePosition - 1} orders ahead` : 'Next on Xerox printer'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-brand-700 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated completion: ~{activeOrder.estimatedMinutes} mins
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Button
                  onClick={() => onNavigate(`/student/orders/${activeOrder.id}/tracking`)}
                  size="lg"
                  className="w-full sm:w-auto shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Track Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid: Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* + New Order Bento Card */}
        <div
          onClick={() => onNavigate('/student/orders/new')}
          className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-6 shadow-card hover:shadow-floating hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              Skip Queue
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold text-white">Start New Order</h3>
            <p className="text-xs text-indigo-100 mt-1">
              Upload PDF or images and receive instant queue token.
            </p>
          </div>
        </div>

        {/* Order History Card */}
        <div
          onClick={() => onNavigate('/student/history')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card hover:shadow-floating hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">
              {myOrders.length} Past Orders
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900">Order History & Receipts</h3>
            <p className="text-xs text-slate-500 mt-1">
              View past printed documents, download receipts, or 1-click reorder.
            </p>
          </div>
        </div>

        {/* Notifications & Queue Alerts Card */}
        <div
          onClick={() => onNavigate('/student/notifications')}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card hover:shadow-floating hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Ready Alerts Active
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900">Queue Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              Live updates when Xerox machines begin printing and when ready for counter collection.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Your Recent Activity</h3>
          <button
            onClick={() => onNavigate('/student/history')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onNavigate(`/student/orders/${order.id}/tracking`)}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:border-brand-200 hover:shadow-floating transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {order.token}
                    </span>
                    <Badge status={order.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order.documents[0]?.name || 'Academic document'} • {order.documents.length} file{order.documents.length > 1 ? 's' : ''} • {formatCurrency(order.pricing.total)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {formatDate(order.createdAt)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
