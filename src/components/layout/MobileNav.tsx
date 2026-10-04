import React from 'react';
import { Home, ListOrdered, Plus, Bell, User as UserIcon, Shield, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath, onNavigate }) => {
  const { role } = useAuth();
  const { notifications, activeOrder } = useOrders();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (role === 'staff') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('/staff')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            currentPath === '/staff' ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/orders')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            currentPath.startsWith('/staff/orders') ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/queue')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            currentPath === '/staff/queue' ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Live Queue</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/analytics')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            currentPath === '/staff/analytics' ? 'text-brand-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px]">Analytics</span>
        </button>
      </nav>
    );
  }

  // Student bottom navigation
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-between shadow-lg">
      <button
        onClick={() => onNavigate('/student')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          currentPath === '/student' ? 'text-brand-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      <button
        onClick={() =>
          onNavigate(activeOrder ? `/student/orders/${activeOrder.id}/tracking` : '/student/history')
        }
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          currentPath.includes('tracking') || currentPath === '/student/history'
            ? 'text-brand-600 font-bold'
            : 'text-slate-500'
        }`}
      >
        <ListOrdered className="w-5 h-5" />
        <span className="text-[10px]">Orders</span>
      </button>

      {/* Prominent floating New Order button */}
      <div className="-mt-5">
        <button
          onClick={() => onNavigate('/student/orders/new')}
          className="w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all"
          aria-label="Create New Order"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      <button
        onClick={() => onNavigate('/student/notifications')}
        className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
          currentPath === '/student/notifications' ? 'text-brand-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        )}
        <span className="text-[10px]">Alerts</span>
      </button>

      <button
        onClick={() => onNavigate('/student/profile')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          currentPath === '/student/profile' ? 'text-brand-600 font-bold' : 'text-slate-500'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
