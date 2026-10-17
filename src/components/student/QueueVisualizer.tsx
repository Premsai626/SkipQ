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
  const myIndex = activeQueue.findIndex(
    (o) => o.id === currentOrder.id || o.token === currentOrder.token
  );
  const ordersAhead = myIndex >= 0 ? myIndex : Math.max(0, currentOrder.queuePosition - 1);

  return (
    <div className="bg-[#111827] rounded-3xl p-5 sm:p-7 border border-[#273244] space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#00D4FF] flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Live Campus Queue
          </span>
          <h3 className="text-lg font-bold text-[#F9FAFB] mt-0.5">Queue Status & Position</h3>
        </div>
        <Badge variant="live" label="LIVE" size="sm" />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-center shadow-lg">
          <span className="text-[10px] font-black text-[#00D4FF] uppercase tracking-wider font-mono">
            Your Position
          </span>
          <p className="text-2xl font-black text-[#F9FAFB] mt-0.5 font-mono">
            #{myIndex >= 0 ? myIndex + 1 : currentOrder.queuePosition || 1}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0D111B] border border-[#273244] text-center shadow-lg">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Orders Ahead
          </span>
          <p className="text-2xl font-black text-[#F9FAFB] mt-0.5 font-mono">
            {ordersAhead}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0D111B] border border-[#273244] text-center shadow-lg">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Estimated Wait
          </span>
          <p className="text-2xl font-black text-[#00D4FF] mt-0.5 font-mono">
            ~{currentOrder.status === 'READY_FOR_PICKUP' ? '0' : currentOrder.estimatedMinutes}m
          </p>
        </div>
      </div>

      {/* Visual Queue Line with smooth animations */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2 font-mono">
          <span>Active Line At Campus Desk</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
        </span>

        <div className="space-y-2.5 pt-1">
          {activeQueue.slice(0, 6).map((item, idx) => {
            const isMe = item.id === currentOrder.id || item.token === currentOrder.token;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isMe
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#00A3FF] text-black border-[#00D4FF] shadow-xl shadow-[#00D4FF]/20 ring-2 ring-[#00D4FF]/40 scale-[1.02]'
                    : 'bg-[#0D111B] border-[#273244] text-[#F9FAFB]/90 hover:border-[#00D4FF]/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono ${
                      isMe ? 'bg-black text-[#00D4FF]' : 'bg-[#1A2232] text-[#9CA3AF]'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm font-black ${
                          isMe ? 'text-black' : 'text-[#F9FAFB]'
                        }`}
                      >
                        {item.token}
                      </span>
                      {isMe && (
                        <span className="text-[9px] uppercase tracking-wider font-black bg-black text-[#00D4FF] px-2 py-0.5 rounded-full font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium ${isMe ? 'text-black/80' : 'text-[#9CA3AF]'}`}>
                      {item.config.service === 'XEROX' ? 'Xerox' : 'Print'} • {item.config.copies} set
                      {item.config.copies > 1 ? 's' : ''} •{' '}
                      {item.documents.reduce((s, d) => s + d.pages, 0)} pgs
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isMe ? (
                    <span className="text-xs font-black bg-black text-[#00D4FF] px-3 py-1 rounded-full shadow-md font-mono">
                      {item.status.replace(/_/g, ' ')}
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

