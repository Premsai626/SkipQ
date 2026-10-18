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
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-[#273244] bg-[#121821]/80 backdrop-blur-2xl p-4 min-h-[calc(100vh-4rem)] relative z-10">
      <div className="space-y-6">
        {/* Role identification banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            role === 'staff'
              ? 'bg-[#18212C] border-[#273244] text-[#F1F5F9] shadow-sm'
              : 'bg-[#18212C] border-[#273244] text-[#F1F5F9] shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                role === 'staff'
                  ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                  : 'bg-[#06D6F0] text-[#0B0F14] shadow-sm font-black'
              }`}
            >
              {role === 'staff' ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight leading-tight text-[#F1F5F9]">
                {role === 'staff' ? 'STAFF OPERATOR' : 'STUDENT PORTAL'}
              </p>
              <p className="text-[10px] text-[#94A3B8] leading-tight">
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
                  className="w-full mt-2 mb-3 flex items-center justify-between px-4 py-3 rounded-xl bg-[#06D6F0] text-[#0B0F14] font-bold text-sm shadow-md hover:bg-[#00b8e6] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <Printer className="w-5 h-5 transition-transform group-hover:scale-105" />
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
                    ? 'bg-[#18212C] text-[#06D6F0] font-bold border border-[#06D6F0]/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#18212C]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#06D6F0]' : 'text-[#6B7280]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#F87171] text-white shadow-sm">
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#06D6F0]/15 border border-[#06D6F0]/30 text-[#06D6F0] uppercase tracking-wider font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer link to landing page */}
      <div className="pt-4 border-t border-[#273244] space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#00D4FF] rounded-xl hover:bg-[#202B3D] transition-colors cursor-pointer"
        >
          <span>View Landing Page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <div className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#273244] text-[10px] text-[#6B7280] text-center font-medium tracking-wide">
          SkipQ • Campus Edition 2026
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
