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
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-[#273244] hover:border-[#FBBF24]/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Pending
          </span>
          <div className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#F9FAFB] mt-3 font-mono">
          {metrics.pendingCount}
        </p>
        <p className="text-[11px] text-[#FBBF24]/80 font-medium mt-1">Awaiting acceptance</p>
      </div>

      {/* 2. Printing */}
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-[#273244] hover:border-[#00D4FF]/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Printing
          </span>
          <div className="p-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 group-hover:scale-105 transition-transform">
            <Printer className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#00D4FF] mt-3 font-mono">
          {metrics.printingCount}
        </p>
        <p className="text-[11px] text-[#00D4FF]/80 font-medium mt-1">Active on machines</p>
      </div>

      {/* 3. Ready */}
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-[#273244] hover:border-[#34D399]/40 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Ready
          </span>
          <div className="p-2 rounded-xl bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#34D399] mt-3 font-mono">
          {metrics.readyCount}
        </p>
        <p className="text-[11px] text-[#34D399]/80 font-medium mt-1">At collection desk</p>
      </div>

      {/* 4. Completed Today */}
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-[#273244] hover:border-[#00D4FF]/20 transition-all duration-200 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
            Completed
          </span>
          <div className="p-2 rounded-xl bg-[#1A2232] text-[#9CA3AF] border border-[#273244] group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#F9FAFB] mt-3 font-mono">
          {metrics.completedTodayCount}
        </p>
        <p className="text-[11px] text-[#6B7280] font-medium mt-1">Zero queue delay</p>
      </div>

      {/* 5. Revenue Today */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#00D4FF]/15 via-[#111827] to-[#0D111B] border border-[#00D4FF]/30 rounded-2xl p-4 sm:p-5 shadow-xl group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wider font-mono">
            Today's Total
          </span>
          <div className="p-2 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 group-hover:scale-105 transition-transform">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-[#F9FAFB] mt-3 font-mono">
          {formatCurrency(metrics.todayRevenue)}
        </p>
        <p className="text-[11px] text-[#9CA3AF] font-medium mt-1">Digital + Counter cash</p>
      </div>
    </div>
  );
};

