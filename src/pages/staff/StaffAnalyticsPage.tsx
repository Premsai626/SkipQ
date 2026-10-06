import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  IndianRupee,
  Sparkles,
  PieChart,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatting';

export const StaffAnalyticsPage: React.FC = () => {
  const { metrics, orders } = useOrders();

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
        <h1 className="text-2xl font-black text-white tracking-tight">
          Operational Analytics & Insights
        </h1>
        <p className="text-sm text-white/50 mt-0.5">
          Real-time equipment utilization, turn-around times, and campus print volume.
        </p>
      </div>

      {/* Top 4 Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
            Total Orders Fulfilled
          </span>
          <p className="text-3xl font-black text-white mt-1 font-mono">
            {metrics.completedTodayCount}
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from last Friday</span>
          </div>
        </div>

        <div className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
            Avg Turnaround Time
          </span>
          <p className="text-3xl font-black text-white mt-1 font-mono">
            {metrics.avgWaitMinutes}m
          </p>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Target &lt; 15 mins met</span>
          </div>
        </div>

        <div className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
            Today's Campus Revenue
          </span>
          <p className="text-3xl font-black text-[#CCFF00] mt-1 font-mono">
            {formatCurrency(metrics.todayRevenue)}
          </p>
          <p className="text-xs text-white/40 mt-1 font-mono">Digital UPI: 78% • Cash: 22%</p>
        </div>

        <div className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider font-mono">
            Top Service Type
          </span>
          <p className="text-base font-black text-white mt-2 leading-tight">
            Spiral Binding & Duplex Print
          </p>
          <span className="text-[11px] font-bold text-[#00F0FF] mt-1 block">
            42% of all exam submissions
          </span>
        </div>
      </div>

      {/* Hourly Orders Graph */}
      <div className="glass-card-dark border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Today's Hourly Print Volume</h3>
            <p className="text-xs text-white/50">
              Orders placed across campus hours (Peak rush at 10:00 AM submission deadline)
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-mono">
            Peak: 28 orders/hr
          </span>
        </div>

        {/* Informative SVG Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {hourlyData.map((d, idx) => {
              const heightPercent = Math.round((d.count / maxHourCount) * 100);
              const isPeak = d.count === maxHourCount;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                      isPeak
                        ? 'bg-[#CCFF00] shadow-lg shadow-[#CCFF00]/30'
                        : 'bg-white/10 hover:bg-[#00F0FF]/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-medium text-white/40 mt-1 whitespace-nowrap font-mono">
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Color vs BW & Finishing Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color vs BW */}
        <div className="glass-card-dark border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Color vs Monochrome Split</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white/70">B&W Monochrome (Economical)</span>
                <span className="text-white font-mono">65% (1,480 pages)</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-white/70 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#00F0FF]">Full Color Pigment Print</span>
                <span className="text-[#00F0FF] font-mono">35% (790 pages)</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-[#00F0FF] rounded-full shadow-xs" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Finishing Breakdown */}
        <div className="glass-card-dark border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4">
          <h3 className="text-sm font-bold text-white">Binding & Finishing Services</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white/70">Spiral Binding with Clear Cover</span>
                <span className="text-white font-mono">42% (58 sets)</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-[#CCFF00] rounded-full shadow-xs" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white/70">Corner & Side Staple</span>
                <span className="text-white font-mono">38% (52 sets)</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-[#00F0FF] rounded-full shadow-xs" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-white/70">Thermal Pouch Lamination</span>
                <span className="text-white font-mono">20% (28 sheets)</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-emerald-400 rounded-full shadow-xs" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
