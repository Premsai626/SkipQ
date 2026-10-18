import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { Button } from '../../components/ui/Button';
import { formatRelativeTime } from '../../utils/formatting';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useOrders();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#06D6F0]" /> Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Real-time updates regarding your queue status, station assignment, and collection alerts.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#273244] pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer font-mono ${
            filter === 'ALL'
              ? 'bg-[#06D6F0] text-black font-bold shadow-sm'
              : 'bg-[#18212C] border border-[#273244] text-[#94A3B8] hover:bg-[#121821]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer font-mono ${
            filter === 'UNREAD'
              ? 'bg-[#06D6F0] text-black font-bold shadow-sm'
              : 'bg-[#18212C] border border-[#273244] text-[#94A3B8] hover:bg-[#121821]'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#121821] rounded-2xl border border-[#273244] p-6 sm:p-8 space-y-2">
          <Bell className="w-10 h-10 text-[#94A3B8]/30 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#F1F5F9]">No notifications to show</p>
          <p className="text-xs text-[#94A3B8]">You're all caught up with your print requests!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.orderId) onNavigate(`/student/orders/${item.orderId}/tracking`);
                }}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                  isUnread
                    ? 'bg-[#121821] border-[#06D6F0]/50'
                    : 'bg-[#121821] border-[#273244] hover:border-[#06D6F0]/30'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                      item.type === 'success'
                        ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20'
                        : item.type === 'error'
                        ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20'
                        : 'bg-[#06D6F0]/10 text-[#06D6F0] border-[#06D6F0]/20'
                    }`}
                  >
                    {item.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.type === 'error' ? (
                      <AlertOctagon className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] truncate">{item.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#06D6F0]" />
                      )}
                      {item.token && (
                        <span className="font-mono text-[11px] font-bold text-[#06D6F0] bg-[#06D6F0]/10 px-1.5 py-0.5 rounded border border-[#06D6F0]/20">
                          {item.token}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed break-words">{item.message}</p>
                    <p className="text-[10px] text-[#94A3B8]/60 pt-0.5 font-mono">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
