import React from 'react';
import { Sparkles, ArrowDown, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';

interface QueueVisualizerProps {
  currentOrder: Order;
  allOrders: Order[];
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({
  currentOrder,
  allOrders,
}) => {
  // Filter active queue orders (Pending, Accepted, Payment Verified, Printing)
  const activeQueue = allOrders
    .filter(
      (o) =>
        o.status === 'PRINTING' ||
        o.status === 'PAYMENT_VERIFIED' ||
        o.status === 'ACCEPTED' ||
        o.status === 'PENDING'
    )
    .sort((a, b) => a.queuePosition - b.queuePosition);

  // Index of current order in this active slice
  const myIndex = activeQueue.findIndex((o) => o.id === currentOrder.id || o.token === currentOrder.token);
  const ordersAhead = myIndex >= 0 ? myIndex : Math.max(0, currentOrder.queuePosition - 1);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
            Live Campus Queue
          </span>
          <h3 className="text-lg font-bold text-slate-900">Queue Status & Position</h3>
        </div>
        <Badge variant="live" label="LIVE" size="sm" />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100/80 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Your Position
          </span>
          <p className="text-xl font-extrabold text-brand-700 mt-0.5">
            #{myIndex >= 0 ? myIndex + 1 : currentOrder.queuePosition || 1}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Orders Ahead
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">
            {ordersAhead}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Estimated Wait
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">
            ~{currentOrder.status === 'READY_FOR_PICKUP' ? '0' : currentOrder.estimatedMinutes}m
          </p>
        </div>
      </div>

      {/* Visual Queue Line with smooth animations */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Active Line At Campus Desk
        </span>

        <div className="space-y-2 pt-1">
          {activeQueue.slice(0, 6).map((item, idx) => {
            const isMe = item.id === currentOrder.id || item.token === currentOrder.token;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isMe
                    ? 'bg-brand-600 text-white border-brand-700 shadow-md ring-4 ring-brand-100 scale-[1.02]'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isMe ? 'bg-white text-brand-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${isMe ? 'text-white' : 'text-slate-900'}`}>
                        {item.token}
                      </span>
                      {isMe && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] ${isMe ? 'text-brand-100' : 'text-slate-500'}`}>
                      {item.config.service === 'XEROX' ? 'Xerox' : 'Print'} • {item.config.copies} set{item.config.copies > 1 ? 's' : ''} • {item.documents.reduce((s, d) => s + d.pages, 0)} pgs
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isMe ? (
                    <span className="text-xs font-bold bg-white text-brand-700 px-2.5 py-1 rounded-full shadow-2xs">
                      {item.status}
                    </span>
                  ) : (
                    <Badge status={item.status} size="sm" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
