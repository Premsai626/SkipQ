import React from 'react';
import { Clock, Printer, CheckCircle, IndianRupee, Layers } from 'lucide-react';
import { OperationalMetrics } from '../../types';
import { formatCurrency } from '../../utils/formatting';

interface StatsOverviewProps {
  metrics: OperationalMetrics;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {/* 1. Pending */}
      <div className="bg-[#121821] rounded-2xl p-3.5 sm:p-4 border border-[#273244] hover:border-[#FBBF24]/40 transition-all duration-200 shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Pending
          </span>
          <div className="p-1.5 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#F1F5F9] mt-2 font-mono">
          {metrics.pendingCount}
        </p>
        <p className="text-[10px] text-[#FBBF24] font-medium mt-0.5">Awaiting acceptance</p>
      </div>

      {/* 2. Printing */}
      <div className="bg-[#121821] rounded-2xl p-3.5 sm:p-4 border border-[#273244] hover:border-[#06D6F0]/40 transition-all duration-200 shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Printing
          </span>
          <div className="p-1.5 rounded-xl bg-[#06D6F0]/10 text-[#06D6F0] border border-[#06D6F0]/20">
            <Printer className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#06D6F0] mt-2 font-mono">
          {metrics.printingCount}
        </p>
        <p className="text-[10px] text-[#06D6F0] font-medium mt-0.5">Active on machines</p>
      </div>

      {/* 3. Ready */}
      <div className="bg-[#121821] rounded-2xl p-3.5 sm:p-4 border border-[#273244] hover:border-[#34D399]/40 transition-all duration-200 shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Ready
          </span>
          <div className="p-1.5 rounded-xl bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#34D399] mt-2 font-mono">
          {metrics.readyCount}
        </p>
        <p className="text-[10px] text-[#34D399] font-medium mt-0.5">At collection desk</p>
      </div>

      {/* 4. Completed Today */}
      <div className="bg-[#121821] rounded-2xl p-3.5 sm:p-4 border border-[#273244] hover:border-[#06D6F0]/20 transition-all duration-200 shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Completed
          </span>
          <div className="p-1.5 rounded-xl bg-[#18212C] text-[#94A3B8] border border-[#273244]">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#F1F5F9] mt-2 font-mono">
          {metrics.completedTodayCount}
        </p>
        <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Zero queue delay</p>
      </div>

      {/* 5. Revenue Today */}
      <div className="col-span-2 lg:col-span-1 bg-[#121821] border border-[#06D6F0]/30 rounded-2xl p-3.5 sm:p-4 shadow-sm group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#06D6F0] uppercase tracking-wider font-mono">
            Today's Total
          </span>
          <div className="p-1.5 rounded-xl bg-[#06D6F0]/20 text-[#06D6F0] border border-[#06D6F0]/30">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-[#F1F5F9] mt-2 font-mono">
          {formatCurrency(metrics.todayRevenue)}
        </p>
        <p className="text-[10px] text-[#94A3B8] font-medium mt-0.5">Digital + Counter cash</p>
      </div>
    </div>
  );
};

