import React from 'react';
import {
  PlusCircle,
  Clock,
  History,
  Bell,
  ArrowRight,
  FileText,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Printer,
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

  const myOrders = orders.filter(
    (o) => o.studentId === user?.id || o.studentId === 'usr_student_1' || o.id === activeOrder?.id
  );
  const recentOrders = myOrders.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Student Print Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1A2232] border border-[#273244] text-[10px] font-black text-[#9CA3AF] tracking-wider">
              CAMPUS NODE
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#F9FAFB] tracking-tight">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1 font-medium">
            Campus Xerox station is live & operational. Upload a document or manage your print tokens.
          </p>
        </div>

        <Button
          onClick={() => onNavigate('/student/orders/new')}
          size="lg"
          variant="primary"
          className="shadow-xl shadow-[#00D4FF]/25 shrink-0"
          leftIcon={<PlusCircle className="w-5 h-5" />}
        >
          + New Print Order
        </Button>
      </div>

      {/* Active Order Spotlight Hero Card */}
      {activeOrder && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF]/25 via-[#8B5CF6]/20 to-[#00D4FF]/10 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative bg-[#111827] rounded-3xl p-6 sm:p-8 border border-[#273244] shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6B7280]">
                    Active Queue Token
                  </span>
                  <Badge status={activeOrder.status} size="md" />
                </div>

                <div className="flex items-baseline gap-4">
                  <h2 className="font-mono text-4xl sm:text-5xl font-black text-[#F9FAFB] tracking-tight">
                    {activeOrder.token}
                  </h2>
                  <span className="text-xs text-[#9CA3AF] font-medium">
                    ({activeOrder.documents.length} file{activeOrder.documents.length !== 1 ? 's' : ''} •{' '}
                    {activeOrder.config.color === 'COLOR' ? 'Color' : 'B&W'})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D4FF] live-indicator-dot" />
                    <strong className="text-[#F9FAFB]">
                      {activeOrder.queuePosition > 1
                        ? `${activeOrder.queuePosition - 1} orders ahead`
                        : 'Next on Xerox printer'}
                    </strong>
                  </span>
                  <span className="text-[#273244]">•</span>
                  <span className="flex items-center gap-1.5 text-[#00D4FF] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Turnaround: ~{activeOrder.estimatedMinutes} mins
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Button
                  onClick={() => onNavigate(`/student/orders/${activeOrder.id}/tracking`)}
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto shadow-lg shadow-[#00D4FF]/25"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Track Live Queue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bento Grid: Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* + New Order Bento Card */}
        <div
          onClick={() => onNavigate('/student/orders/new')}
          className="relative overflow-hidden bg-gradient-to-br from-[#00D4FF] to-[#0284c7] text-black rounded-3xl p-6 shadow-xl shadow-[#00D4FF]/20 hover:shadow-2xl hover:shadow-[#00D4FF]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group border border-[#00D4FF]/40"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-black/10 border border-black/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6 text-black" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#00D4FF] px-3 py-1 rounded-full shadow-md">
              Instant
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-black text-black">Start New Order</h3>
            <p className="text-xs text-black/80 mt-1.5 font-medium leading-relaxed">
              Upload PDF or images to receive your 4-digit counter token instantly.
            </p>
          </div>
        </div>

        {/* Order History Card */}
        <div
          onClick={() => onNavigate('/student/history')}
          className="bg-[#111827] hover:bg-[#1A2232] rounded-3xl p-6 border border-[#273244] hover:border-[#00D4FF]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#9CA3AF] group-hover:scale-110 group-hover:text-[#00D4FF] group-hover:bg-[#00D4FF]/10 transition-all">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#9CA3AF] px-2.5 py-1 rounded-full bg-[#1A2232] border border-[#273244]">
              {myOrders.length} Past Orders
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#F9FAFB]">Order History</h3>
            <p className="text-xs text-[#9CA3AF] mt-1.5 font-medium leading-relaxed">
              View past printed documents, download receipts, or reorder files.
            </p>
          </div>
        </div>

        {/* Campus Store Card */}
        <div
          onClick={() => onNavigate('/student/store')}
          className="bg-[#111827] hover:bg-[#1A2232] rounded-3xl p-6 border border-[#273244] hover:border-[#8B5CF6]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#9CA3AF] group-hover:scale-110 group-hover:text-[#8B5CF6] group-hover:bg-[#8B5CF6]/10 transition-all">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-2.5 py-1 rounded-full">
              In Stock
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#F9FAFB]">Stationery Store</h3>
            <p className="text-xs text-[#9CA3AF] mt-1.5 font-medium leading-relaxed">
              Browse exam pens, lab assignment record sheets, and spiral binders.
            </p>
          </div>
        </div>

        {/* Notifications & Queue Alerts Card */}
        <div
          onClick={() => onNavigate('/student/notifications')}
          className="bg-[#111827] hover:bg-[#1A2232] rounded-3xl p-6 border border-[#273244] hover:border-[#34D399]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#9CA3AF] group-hover:scale-110 group-hover:text-[#34D399] group-hover:bg-[#34D399]/10 transition-all">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30 px-2.5 py-1 rounded-full">
              Live Alerts
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#F9FAFB]">Notifications</h3>
            <p className="text-xs text-[#9CA3AF] mt-1.5 font-medium leading-relaxed">
              Instant alerts when printing begins and when ready at counter.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#F9FAFB] flex items-center gap-2">
            <span>Recent Activity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
          </h3>
          <button
            onClick={() => onNavigate('/student/history')}
            className="text-xs font-bold text-[#00D4FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-[#111827] rounded-3xl p-10 text-center text-[#9CA3AF] space-y-4 border border-[#273244]">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#6B7280] mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F9FAFB]">No recent orders placed yet</p>
              <p className="text-xs text-[#6B7280] mt-1">
                Upload your first document to start printing with a 4-digit token.
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
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onNavigate(`/student/orders/${order.id}/tracking`)}
                className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-[#273244] hover:border-[#00D4FF]/40 hover:bg-[#1A2232] transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#1A2232] border border-[#273244] group-hover:bg-[#00D4FF]/15 group-hover:text-[#00D4FF] group-hover:border-[#00D4FF]/30 text-[#9CA3AF] flex items-center justify-center shrink-0 transition-all duration-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#F9FAFB] text-base">
                        {order.token}
                      </span>
                      <Badge status={order.status} size="sm" />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      {order.documents[0]?.name || 'Academic document'} • {order.documents.length} file
                      {order.documents.length > 1 ? 's' : ''} • {formatCurrency(order.pricing.total)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280] hidden sm:inline font-mono">
                    {formatDate(order.createdAt)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#00D4FF] group-hover:translate-x-1 transition-all" />
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
