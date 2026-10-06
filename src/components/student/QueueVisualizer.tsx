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
    <div className="glass-card-dark rounded-3xl p-5 sm:p-7 border border-white/10 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Live Campus Queue
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Queue Status & Position</h3>
        </div>
        <Badge variant="live" label="LIVE" size="sm" />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-center shadow-lg">
          <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-wider">
            Your Position
          </span>
          <p className="text-2xl font-black text-white mt-0.5 font-mono">
            #{myIndex >= 0 ? myIndex + 1 : currentOrder.queuePosition || 1}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center shadow-lg">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Orders Ahead
          </span>
          <p className="text-2xl font-black text-white mt-0.5 font-mono">
            {ordersAhead}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center shadow-lg">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Estimated Wait
          </span>
          <p className="text-2xl font-black text-[#00F0FF] mt-0.5 font-mono">
            ~{currentOrder.status === 'READY_FOR_PICKUP' ? '0' : currentOrder.estimatedMinutes}m
          </p>
        </div>
      </div>

      {/* Visual Queue Line with smooth animations */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
          <span>Active Line At Campus Desk</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
        </span>

        <div className="space-y-2.5 pt-1">
          {activeQueue.slice(0, 6).map((item, idx) => {
            const isMe = item.id === currentOrder.id || item.token === currentOrder.token;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isMe
                    ? 'bg-gradient-to-r from-[#CCFF00] to-[#b8e600] text-black border-[#CCFF00] shadow-xl shadow-[#CCFF00]/20 ring-2 ring-[#CCFF00]/40 scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-white/80 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isMe ? 'bg-black text-[#CCFF00]' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm font-black ${
                          isMe ? 'text-black' : 'text-white'
                        }`}
                      >
                        {item.token}
                      </span>
                      {isMe && (
                        <span className="text-[9px] uppercase tracking-wider font-black bg-black text-[#CCFF00] px-2 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium ${isMe ? 'text-black/80' : 'text-white/50'}`}>
                      {item.config.service === 'XEROX' ? 'Xerox' : 'Print'} • {item.config.copies} set
                      {item.config.copies > 1 ? 's' : ''} •{' '}
                      {item.documents.reduce((s, d) => s + d.pages, 0)} pgs
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isMe ? (
                    <span className="text-xs font-black bg-black text-[#CCFF00] px-3 py-1 rounded-full shadow-md">
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

