import React from 'react';
import {
  ShieldCheck,
  Layers,
  Printer,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { StatsOverview } from '../../components/staff/StatsOverview';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatRelativeTime } from '../../utils/formatting';

interface StaffDashboardProps {
  onNavigate: (path: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const { orders, metrics, simulateQueueStep } = useOrders();

  // Active incoming and processing orders
  const activeOrders = orders.filter(
    (o) =>
      o.status === 'PENDING' ||
      o.status === 'ACCEPTED' ||
      o.status === 'PRINTING' ||
      o.status === 'READY_FOR_PICKUP'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-wider">
              STAFF COMMAND HUB
            </span>
            <Badge variant="live" label="DESK ONLINE" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Library Ground Floor • Counter #1
          </h1>
          <p className="text-xs text-white/50 mt-1 font-medium">
            Operational dashboard for high-speed print fulfillment, queue throttling, and student collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/staff/queue')}
            leftIcon={<Layers className="w-4 h-4 text-[#00F0FF]" />}
          >
            Live Queue Board
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('/staff/orders')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Process Orders ({metrics.pendingCount + metrics.printingCount})
          </Button>
        </div>
      </div>

      {/* 5 Core KPI Metric Cards */}
      <StatsOverview metrics={metrics} />

      {/* Desk Operational Load Bar */}
      <div className="glass-card-dark rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Current Campus Desk Load</span>
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] live-indicator-dot" />
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Optimal throughput: 4 Laser printers connected • Paper tray levels at 85%
            </p>
          </div>
          <span className="text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-3 py-1 rounded-full">
            Capacity: 65% Normal
          </span>
        </div>

        {/* Multi-segment capacity progress bar */}
        <div className="h-3 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden flex p-0.5">
          <div
            className="bg-[#00F0FF] rounded-full transition-all duration-500 shadow-sm shadow-[#00F0FF]/50"
            style={{ width: `${Math.min(50, metrics.printingCount * 8)}%` }}
            title="Printing load"
          />
          <div
            className="bg-amber-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-400/50"
            style={{ width: `${Math.min(30, metrics.pendingCount * 5)}%` }}
            title="Pending load"
          />
          <div
            className="bg-[#CCFF00] rounded-full transition-all duration-500 shadow-sm shadow-[#CCFF00]/50"
            style={{ width: `${Math.min(20, metrics.readyCount * 4)}%` }}
            title="Ready load"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-white/60 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" /> Currently Printing ({metrics.printingCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Pending Review ({metrics.pendingCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#CCFF00]" /> Ready for Collection ({metrics.readyCount})
            </span>
          </div>

          <button
            onClick={simulateQueueStep}
            className="font-bold text-[#CCFF00] hover:underline flex items-center gap-1.5 cursor-pointer bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Simulate Queue Cycle</span>
          </button>
        </div>
      </div>

      {/* Priority Incoming Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Active Processing Line ({activeOrders.length})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
          </h3>
          <button
            onClick={() => onNavigate('/staff/orders')}
            className="text-xs font-bold text-[#CCFF00] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Orders Table</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.slice(0, 6).map((order) => {
            const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

            return (
              <div
                key={order.id}
                onClick={() => onNavigate('/staff/orders')}
                className="glass-card-dark rounded-2xl p-5 border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-200 cursor-pointer space-y-3.5 shadow-xl group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-black text-white">
                    {order.token}
                  </span>
                  <Badge status={order.status} size="sm" />
                </div>

                <div className="text-xs text-white/70 space-y-1">
                  <p className="font-bold text-white text-sm">{order.studentName}</p>
                  <p className="text-white/50 truncate">
                    {order.documents[0]?.name} • {totalPages} pages ({order.config.copies}x)
                  </p>
                  <p className="text-[11px] text-white/40 font-mono">
                    {order.config.color} • {order.config.paperSize} • {order.config.finishing}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#CCFF00] text-sm">
                    {formatCurrency(order.pricing.total)}
                  </span>
                  <span className="text-[11px] text-white/60 font-semibold group-hover:text-white group-hover:translate-x-0.5 transition-all">
                    Manage Order →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

