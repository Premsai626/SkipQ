import React from 'react';
import {
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { StatsOverview } from '../../components/staff/StatsOverview';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatting';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[#18212C] border border-[#273244] text-[#94A3B8] text-[10px] font-bold uppercase tracking-wider font-mono">
              STAFF COMMAND HUB
            </span>
            <Badge variant="live" label="DESK ONLINE" size="sm" />
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#F1F5F9] tracking-tight">
            Library Ground Floor • Counter #1
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Operational dashboard for high-speed print fulfillment, queue throttling, and student collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/staff/queue')}
            leftIcon={<Layers className="w-4 h-4 text-[#06D6F0]" />}
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
      {/* Desk Operational Load Bar */}
      <div className="bg-[#121821] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#273244] space-y-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
              <span>Current Campus Desk Load</span>
              <span className="w-2 h-2 rounded-full bg-[#06D6F0] animate-pulse" />
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Optimal throughput: 4 Laser printers connected • Paper tray levels at 85%
            </p>
          </div>
          <span className="text-xs font-bold text-[#06D6F0] bg-[#06D6F0]/10 border border-[#06D6F0]/30 px-3 py-1 rounded-full font-mono w-fit">
            Capacity: 65% Normal
          </span>
        </div>

        {/* Multi-segment capacity progress bar */}
        <div className="h-2.5 w-full bg-[#0B0F14] border border-[#273244] rounded-full overflow-hidden flex p-0.5">
          <div
            className="bg-[#06D6F0] rounded-full transition-all duration-500 shadow-sm shadow-[#06D6F0]/50"
            style={{ width: `${Math.min(50, metrics.printingCount * 8)}%` }}
            title="Printing load"
          />
          <div
            className="bg-[#FBBF24] rounded-full transition-all duration-500 shadow-sm shadow-[#FBBF24]/50"
            style={{ width: `${Math.min(30, metrics.pendingCount * 5)}%` }}
            title="Pending load"
          />
          <div
            className="bg-[#34D399] rounded-full transition-all duration-500 shadow-sm shadow-[#34D399]/50"
            style={{ width: `${Math.min(20, metrics.readyCount * 4)}%` }}
            title="Ready load"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8] pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-sm bg-[#06D6F0]" /> Currently Printing ({metrics.printingCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-sm bg-[#FBBF24]" /> Pending Review ({metrics.pendingCount})
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-sm bg-[#34D399]" /> Ready for Collection ({metrics.readyCount})
            </span>
          </div>

          <button
            onClick={simulateQueueStep}
            className="font-bold text-[#06D6F0] hover:underline flex items-center gap-1.5 cursor-pointer bg-[#18212C] border border-[#273244] px-3 py-1 rounded-full hover:bg-[#202B3D] transition-all font-mono"
          >
            <Zap className="w-3.5 h-3.5 text-[#06D6F0]" />
            <span>Simulate Cycle</span>
          </button>
        </div>
      </div>

      {/* Priority Incoming Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
            <span>Active Processing Line ({activeOrders.length})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06D6F0] animate-pulse" />
          </h3>
          <button
            onClick={() => onNavigate('/staff/orders')}
            className="text-xs font-semibold text-[#06D6F0] hover:underline flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>Open Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {activeOrders.slice(0, 6).map((order) => {
            const totalPages = order.documents.reduce((s, d) => s + d.pages, 0);

            return (
              <div
                key={order.id}
                onClick={() => onNavigate('/staff/orders')}
                className="bg-[#121821] rounded-2xl p-4 border border-[#273244] hover:border-[#06D6F0]/40 transition-all duration-200 cursor-pointer space-y-2.5 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-[#F1F5F9]">
                    {order.token}
                  </span>
                  <Badge status={order.status} size="sm" />
                </div>

                <div className="text-xs text-[#94A3B8] space-y-0.5">
                  <p className="font-bold text-[#F1F5F9] text-sm">{order.studentName}</p>
                  <p className="text-[#94A3B8] truncate">
                    {order.documents[0]?.name} • {totalPages} pages ({order.config.copies}x)
                  </p>
                  <p className="text-[11px] text-[#6B7280] font-mono">
                    {order.config.color} • {order.config.paperSize} • {order.config.finishing}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#273244] flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#06D6F0] text-sm">
                    {formatCurrency(order.pricing.total)}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-semibold group-hover:text-[#F1F5F9] group-hover:translate-x-0.5 transition-all">
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

