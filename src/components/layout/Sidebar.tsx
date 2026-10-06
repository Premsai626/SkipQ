import React from 'react';
import {
  LayoutDashboard,
  Printer,
  History,
  ShoppingBag,
  Bell,
  User as UserIcon,
  ShieldCheck,
  ListOrdered,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  isCta?: boolean;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { role } = useAuth();
  const { notifications } = useOrders();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentNavItems: NavItem[] = [
    { label: 'Home', path: '/student', icon: LayoutDashboard },
    { label: 'Print / Xerox', path: '/student/orders/new', icon: Printer, isCta: true },
    { label: 'My Orders', path: '/student/history', icon: History },
    { label: 'Store', path: '/student/store', icon: ShoppingBag },
    { label: 'Notifications', path: '/student/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: '/student/profile', icon: UserIcon },
  ];

  const staffNavItems: NavItem[] = [
    { label: 'Home', path: '/staff', icon: LayoutDashboard },
    { label: 'Print Queue', path: '/staff/queue', icon: Layers, badge: 'Live' },
    { label: 'Orders', path: '/staff/orders', icon: ListOrdered },
    { label: 'Store Management', path: '/staff/store', icon: ShoppingBag },
    { label: 'Notifications', path: '/staff/notifications', icon: Bell, count: unreadCount },
    { label: 'Profile', path: '/staff/profile', icon: UserIcon },
  ];

  const navItems = role === 'staff' ? staffNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-white/10 bg-[#09090b]/60 backdrop-blur-2xl p-4 min-h-[calc(100vh-4rem)] relative z-10">
      <div className="space-y-6">
        {/* Role identification banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            role === 'staff'
              ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/15 text-white shadow-lg'
              : 'bg-gradient-to-r from-[#CCFF00]/10 to-[#00F0FF]/5 border-[#CCFF00]/20 text-white shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-inner ${
                role === 'staff'
                  ? 'bg-white/15 text-[#CCFF00] border border-white/20'
                  : 'bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/20'
              }`}
            >
              {role === 'staff' ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-black tracking-tight leading-tight">
                {role === 'staff' ? 'STAFF OPERATOR' : 'STUDENT PORTAL'}
              </p>
              <p className="text-[10px] text-white/50 leading-tight">
                {role === 'staff' ? 'Station #1 • Main Desk' : 'Verified Campus ID'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (item.path !== '/' &&
                currentPath.startsWith(item.path) &&
                item.path !== '/student' &&
                item.path !== '/staff');

            if (item.isCta) {
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.path)}
                  className="w-full mt-2 mb-3 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#CCFF00] text-black font-black text-sm shadow-xl shadow-[#CCFF00]/20 hover:bg-[#b8e600] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Print / Xerox</span>
                  </div>
                  <span className="text-[9px] bg-black/15 text-black border border-black/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                    Instant
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer select-none text-left ${
                  isActive
                    ? 'bg-white/15 text-white font-black border border-white/20 shadow-md backdrop-blur-xl'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#CCFF00]' : 'text-white/40'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer link to landing page */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span>View Landing Page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 text-center font-medium tracking-wide">
          SkipQ • Campus Edition 2026
        </div>
      </div>
    </aside>
  );
};
