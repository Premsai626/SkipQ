import React from 'react';
import { Home, ListOrdered, Plus, Bell, User as UserIcon, Layers, ShoppingBag } from 'lucide-react';
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('/staff')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/queue')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/queue' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Queue</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/orders')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/staff/orders') ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/store')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/store' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Store</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/profile')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/profile' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    );
  }

  // Student bottom navigation
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onNavigate('/student')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      <button
        onClick={() =>
          onNavigate(activeOrder ? `/student/orders/${activeOrder.id}/tracking` : '/student/history')
        }
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath.includes('tracking') || currentPath === '/student/history'
            ? 'text-[#CCFF00] font-bold'
            : 'text-white/50 hover:text-white'
        }`}
      >
        <ListOrdered className="w-5 h-5" />
        <span className="text-[10px]">Orders</span>
      </button>

      {/* Prominent floating New Order button */}
      <div className="-mt-6">
        <button
          onClick={() => onNavigate('/student/orders/new')}
          className="w-13 h-13 rounded-full bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/30 flex items-center justify-center hover:bg-[#b8e600] active:scale-95 transition-all cursor-pointer border-2 border-[#09090b]"
          aria-label="Create New Order"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <button
        onClick={() => onNavigate('/student/store')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/store' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px]">Store</span>
      </button>

      <button
        onClick={() => onNavigate('/student/profile')}
        className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/profile' ? 'text-[#CCFF00] font-bold' : 'text-white/50 hover:text-white'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
