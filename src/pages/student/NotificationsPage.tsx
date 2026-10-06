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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#CCFF00]" /> Notification Center
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
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
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
            filter === 'ALL'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
            filter === 'UNREAD'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-card-dark rounded-3xl border border-white/10 p-8 space-y-2 backdrop-blur-2xl">
          <Bell className="w-10 h-10 text-white/20 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">No notifications to show</p>
          <p className="text-xs text-white/40">You're all caught up with your print requests!</p>
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
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 backdrop-blur-2xl ${
                  isUnread
                    ? 'glass-card-dark border-[#CCFF00]/40 bg-[#CCFF00]/5 shadow-lg shadow-[#CCFF00]/5'
                    : 'glass-card-dark border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      item.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.type === 'error'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
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
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
                      )}
                      {item.token && (
                        <span className="font-mono text-xs font-black text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-md border border-[#CCFF00]/20">
                          {item.token}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed">{item.message}</p>
                    <p className="text-[10px] text-white/30 pt-1 font-mono">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
