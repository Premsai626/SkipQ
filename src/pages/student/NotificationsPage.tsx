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
          <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#00D4FF]" /> Notification Center
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
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
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
            filter === 'ALL'
              ? 'bg-[#00D4FF] text-black font-black shadow-md shadow-[#00D4FF]/20'
              : 'bg-[#0D111B] border border-[#273244] text-[#9CA3AF] hover:bg-[#1A2232]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
            filter === 'UNREAD'
              ? 'bg-[#00D4FF] text-black font-black shadow-md shadow-[#00D4FF]/20'
              : 'bg-[#0D111B] border border-[#273244] text-[#9CA3AF] hover:bg-[#1A2232]'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111827] rounded-3xl border border-[#273244] p-8 space-y-2">
          <Bell className="w-10 h-10 text-[#9CA3AF]/30 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#F9FAFB]">No notifications to show</p>
          <p className="text-xs text-[#9CA3AF]">You're all caught up with your print requests!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.orderId) onNavigate(`/student/orders/${item.orderId}/tracking`);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  isUnread
                    ? 'bg-[#111827] border-[#00D4FF]/40 bg-[#00D4FF]/5 shadow-lg shadow-[#00D4FF]/5'
                    : 'bg-[#111827] border-[#273244] hover:border-[#00D4FF]/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      item.type === 'success'
                        ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20'
                        : item.type === 'error'
                        ? 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/20'
                        : 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20'
                    }`}
                  >
                    {item.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : item.type === 'error' ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#F9FAFB]">{item.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
                      )}
                      {item.token && (
                        <span className="font-mono text-xs font-black text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-md border border-[#00D4FF]/20">
                          {item.token}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.message}</p>
                    <p className="text-[10px] text-[#6B7280] pt-1 font-mono">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F9FAFB] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
