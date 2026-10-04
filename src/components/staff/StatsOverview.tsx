import React from 'react';
import { Clock, Printer, CheckCircle, IndianRupee, Layers } from 'lucide-react';
import { OperationalMetrics } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface StatsOverviewProps {
  metrics: OperationalMetrics;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Pending */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:border-amber-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending
          </span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {metrics.pendingCount}
        </p>
        <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting acceptance</p>
      </div>

      {/* 2. Printing */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:border-sky-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Printing
          </span>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
            <Printer className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {metrics.printingCount}
        </p>
        <p className="text-[11px] text-sky-700 font-medium mt-1">Active on machines</p>
      </div>

      {/* 3. Ready */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ready
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {metrics.readyCount}
        </p>
        <p className="text-[11px] text-emerald-700 font-medium mt-1">At collection desk</p>
      </div>

      {/* 4. Completed Today */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completed Today
          </span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {metrics.completedTodayCount}
        </p>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Zero queue delay</p>
      </div>

      {/* 5. Revenue Today */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
            Today's Total
          </span>
          <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white mt-2">
          {formatCurrency(metrics.todayRevenue)}
        </p>
        <p className="text-[11px] text-indigo-300 font-medium mt-1">Digital + Counter cash</p>
      </div>
    </div>
  );
};
