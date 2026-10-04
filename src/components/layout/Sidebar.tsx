import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  History,
  Bell,
  User as UserIcon,
  ShieldCheck,
  ListOrdered,
  BarChart3,
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
  const { notifications, activeOrder } = useOrders();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'New Order', path: '/student/orders/new', icon: PlusCircle, isCta: true },
    {
      label: 'Live Queue Tracking',
      path: activeOrder ? `/student/orders/${activeOrder.id}/tracking` : '/student',
      icon: Clock,
      badge: activeOrder?.status === 'PRINTING' ? 'Printing' : activeOrder?.status === 'READY_FOR_PICKUP' ? 'Ready' : undefined,
    },
    { label: 'Order History', path: '/student/history', icon: History },
    { label: 'Notifications', path: '/student/notifications', icon: Bell, count: unreadCount },
    { label: 'My Profile', path: '/student/profile', icon: UserIcon },
  ];

  const staffNavItems: NavItem[] = [
    { label: 'Operational Hub', path: '/staff', icon: LayoutDashboard },
    { label: 'Incoming Orders', path: '/staff/orders', icon: ListOrdered },
    { label: 'Live Queue Board', path: '/staff/queue', icon: Layers, badge: 'Live' },
    { label: 'Operational Analytics', path: '/staff/analytics', icon: BarChart3 },
  ];

  const navItems = role === 'staff' ? staffNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-200/80 bg-white/70 backdrop-blur-md p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Role identification banner */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between ${
            role === 'staff'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-brand-50/70 border-brand-100 text-brand-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                role === 'staff' ? 'bg-slate-800 text-indigo-400' : 'bg-brand-600 text-white'
              }`}
            >
              {role === 'staff' ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {role === 'staff' ? 'STAFF OPERATOR' : 'STUDENT PORTAL'}
              </p>
              <p className="text-[10px] opacity-75 leading-tight">
                {role === 'staff' ? 'Counter #2 • Main Desk' : 'Verified Campus Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path) && item.path !== '/student' && item.path !== '/staff');

            if (item.isCta) {
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.path)}
                  className="w-full mt-2 mb-3 flex items-center justify-between px-4 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-sm hover:bg-brand-700 hover:shadow-glow transition-all duration-200 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span>New Order</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    Skip Queue
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer select-none text-left ${
                  isActive
                    ? 'bg-slate-100 text-brand-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-700 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer link to landing page */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>View Landing Page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-400 text-center">
          SkipQ • Campus Edition 2026
        </div>
      </div>
    </aside>
  );
};
