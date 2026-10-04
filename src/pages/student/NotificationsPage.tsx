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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time updates regarding your queue status and collection alerts.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filter === 'UNREAD' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="text-sm font-bold text-slate-700">No notifications to show</p>
          <p className="text-xs text-slate-400">You're all caught up with your print requests!</p>
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
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-brand-50/40 border-brand-200/80 shadow-xs'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === 'success'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.type === 'error'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-brand-50 text-brand-600'
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
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                      )}
                      <span className="font-mono text-xs font-bold text-brand-600">
                        {item.token}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
