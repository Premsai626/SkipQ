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
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'PRINTING' || o.status === 'READY_FOR_PICKUP'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
              STAFF COMMAND HUB
            </span>
            <Badge variant="live" label="DESK ONLINE" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Library Ground Floor • Counter #2
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational dashboard for high-speed print fulfillment, queue throttling, and student collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/staff/queue')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Live Queue Board
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigate('/staff/orders')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Process Orders ({metrics.pendingCount + metrics.printingCount})
          </Button>
        </div>
      </div>

      {/* 5 Core KPI Metric Cards (Specification 25) */}
      <StatsOverview metrics={metrics} />

      {/* Desk Operational Load Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Campus Desk Load</h3>
            <p className="text-xs text-slate-500">
              Optimal throughput: 4 Laser printers connected • Paper tray levels at 85%
            </p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Capacity: 65% Normal
          </span>
        </div>

        {/* Multi-segment capacity progress bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-sky-500 transition-all duration-500"
            style={{ width: `${Math.min(50, metrics.printingCount * 8)}%` }}
            title="Printing load"
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.min(30, metrics.pendingCount * 5)}%` }}
            title="Pending load"
          />
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(20, metrics.readyCount * 4)}%` }}
            title="Ready load"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Currently Printing ({metrics.printingCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Pending Review ({metrics.pendingCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Ready for Collection ({metrics.readyCount})
            </span>
          </div>

          <button
            onClick={simulateQueueStep}
            className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Simulate Print Cycle Advance</span>
          </button>
        </div>
      </div>

      {/* Priority Incoming Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Active Processing Line ({activeOrders.length})
          </h3>
          <button
            onClick={() => onNavigate('/staff/orders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
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
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card hover:border-brand-200 hover:shadow-floating transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-slate-900">
                    {order.token}
                  </span>
                  <Badge status={order.status} size="sm" />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">{order.studentName}</p>
                  <p className="text-slate-500 truncate">
                    {order.documents[0]?.name} • {totalPages} pages ({order.config.copies}x)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {order.config.color} • {order.config.paperSize} • {order.config.finishing}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(order.pricing.total)}
                  </span>
                  <span className="text-[11px] text-brand-600 font-semibold">
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
