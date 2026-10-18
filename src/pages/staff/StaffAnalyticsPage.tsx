import React from 'react';
import {
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatting';

export const StaffAnalyticsPage: React.FC = () => {
  const { metrics } = useOrders();

  // Realistic hourly order data (8 AM to 6 PM)
  const hourlyData = [
    { hour: '8 AM', count: 6 },
    { hour: '9 AM', count: 18 },
    { hour: '10 AM', count: 28 }, // peak morning submissions
    { hour: '11 AM', count: 24 },
    { hour: '12 PM', count: 15 },
    { hour: '1 PM', count: 12 },
    { hour: '2 PM', count: 22 }, // post-lunch lab record rush
    { hour: '3 PM', count: 19 },
    { hour: '4 PM', count: 14 },
    { hour: '5 PM', count: 8 },
  ];

  const maxHourCount = Math.max(...hourlyData.map((d) => d.count));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
          Operational Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Real-time equipment utilization, turn-around times, and campus print volume.
        </p>
      </div>

      {/* Top 4 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Total Orders Fulfilled
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-1 font-mono">
            {metrics.completedTodayCount}
          </p>
          <div className="flex items-center gap-1 text-[#34D399] text-xs font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from last Friday</span>
          </div>
        </div>

        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Avg Turnaround Time
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mt-1 font-mono">
            {metrics.avgWaitMinutes}m
          </p>
          <div className="flex items-center gap-1 text-[#34D399] text-xs font-semibold mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Target &lt; 15 mins met</span>
          </div>
        </div>

        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Today's Campus Revenue
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#06D6F0] mt-1 font-mono">
            {formatCurrency(metrics.todayRevenue)}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">Digital UPI: 78% • Cash: 22%</p>
        </div>

        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
            Top Service Type
          </span>
          <p className="text-sm sm:text-base font-bold text-[#F1F5F9] mt-1.5 leading-tight">
            Spiral Binding & Duplex Print
          </p>
          <span className="text-[11px] font-bold text-[#06D6F0] mt-1 block font-mono">
            42% of all exam submissions
          </span>
        </div>
      </div>

      {/* Hourly Orders Graph */}
      <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9]">Today's Hourly Print Volume</h3>
            <p className="text-xs text-[#94A3B8]">
              Orders placed across campus hours (Peak rush at 10:00 AM submission deadline)
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#06D6F0]/10 text-[#06D6F0] border border-[#06D6F0]/20 font-mono w-fit">
            Peak: 28 orders/hr
          </span>
        </div>

        {/* Informative SVG Bar Chart with Horizontal Scroll on Narrow Screens */}
        <div className="pt-4 pb-2 overflow-x-auto scrollbar-none">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 min-w-[460px] sm:min-w-0">
            {hourlyData.map((d, idx) => {
              const heightPercent = Math.round((d.count / maxHourCount) * 100);
              const isPeak = d.count === maxHourCount;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-[#94A3B8] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                      isPeak
                        ? 'bg-[#06D6F0]'
                        : 'bg-[#18212C] hover:bg-[#06D6F0]/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-medium text-[#94A3B8]/60 mt-1 whitespace-nowrap font-mono">
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Color vs BW & Finishing Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Color vs BW */}
        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-[#F1F5F9]">Color vs Monochrome Split</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#94A3B8]">B&W Monochrome (Economical)</span>
                <span className="text-[#F1F5F9] font-mono">65% (1,480 pages)</span>
              </div>
              <div className="h-2.5 w-full bg-[#18212C] rounded-full overflow-hidden border border-[#273244]">
                <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#06D6F0]">Full Color Pigment Print</span>
                <span className="text-[#06D6F0] font-mono">35% (790 pages)</span>
              </div>
              <div className="h-2.5 w-full bg-[#18212C] rounded-full overflow-hidden border border-[#273244]">
                <div className="h-full bg-[#06D6F0] rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Finishing Breakdown */}
        <div className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-[#F1F5F9]">Binding & Finishing Services</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#94A3B8]">Spiral Binding with Clear Cover</span>
                <span className="text-[#F1F5F9] font-mono">42% (58 sets)</span>
              </div>
              <div className="h-2.5 w-full bg-[#18212C] rounded-full overflow-hidden border border-[#273244]">
                <div className="h-full bg-[#06D6F0] rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#94A3B8]">Corner & Side Staple</span>
                <span className="text-[#F1F5F9] font-mono">38% (52 sets)</span>
              </div>
              <div className="h-2.5 w-full bg-[#18212C] rounded-full overflow-hidden border border-[#273244]">
                <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#94A3B8]">Thermal Pouch Lamination</span>
                <span className="text-[#F1F5F9] font-mono">20% (28 sheets)</span>
              </div>
              <div className="h-2.5 w-full bg-[#18212C] rounded-full overflow-hidden border border-[#273244]">
                <div className="h-full bg-[#34D399] rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
