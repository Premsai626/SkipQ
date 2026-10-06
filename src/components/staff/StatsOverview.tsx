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
      <div className="glass-card-dark rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-amber-500/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            Pending
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
          {metrics.pendingCount}
        </p>
        <p className="text-[11px] text-amber-400/80 font-medium mt-1">Awaiting acceptance</p>
      </div>

      {/* 2. Printing */}
      <div className="glass-card-dark rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#00F0FF]/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            Printing
          </span>
          <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 group-hover:scale-105 transition-transform">
            <Printer className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#00F0FF] mt-3 font-mono">
          {metrics.printingCount}
        </p>
        <p className="text-[11px] text-[#00F0FF]/80 font-medium mt-1">Active on machines</p>
      </div>

      {/* 3. Ready */}
      <div className="glass-card-dark rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#CCFF00]/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            Ready
          </span>
          <div className="p-2 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#CCFF00] mt-3 font-mono">
          {metrics.readyCount}
        </p>
        <p className="text-[11px] text-[#CCFF00]/80 font-medium mt-1">At collection desk</p>
      </div>

      {/* 4. Completed Today */}
      <div className="glass-card-dark rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
            Completed
          </span>
          <div className="p-2 rounded-xl bg-white/5 text-white/70 border border-white/10 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
          {metrics.completedTodayCount}
        </p>
        <p className="text-[11px] text-white/40 font-medium mt-1">Zero queue delay</p>
      </div>

      {/* 5. Revenue Today */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#CCFF00]/15 via-white/5 to-white/2 border border-[#CCFF00]/30 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-2xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#CCFF00] uppercase tracking-wider">
            Today's Total
          </span>
          <div className="p-2 rounded-xl bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 group-hover:scale-105 transition-transform">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
          {formatCurrency(metrics.todayRevenue)}
        </p>
        <p className="text-[11px] text-white/50 font-medium mt-1">Digital + Counter cash</p>
      </div>
    </div>
  );
};

