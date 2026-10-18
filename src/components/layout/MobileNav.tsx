import React from 'react';
import { Home, ListOrdered, Plus, User as UserIcon, Layers, ShoppingBag } from 'lucide-react';
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
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121821]/98 backdrop-blur-xl border-t border-[#273244] px-1 pt-1.5 flex items-center justify-around shadow-2xl select-none"
        style={{ paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Staff Bottom Navigation"
      >
        <button
          type="button"
          onClick={() => onNavigate('/staff')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/staff/queue')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/queue' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-1">Queue</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/staff/orders')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/staff/orders') ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px] mt-1">Orders</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/staff/store')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/store' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-1">Store</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/staff/profile')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/profile' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </nav>
    );
  }

  // Student bottom navigation
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121821]/98 backdrop-blur-xl border-t border-[#273244] px-1 pt-1.5 flex items-center justify-around shadow-2xl select-none"
      style={{ paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Student Bottom Navigation"
    >
      <button
        type="button"
        onClick={() => onNavigate('/student')}
        className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-1">Home</span>
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate(activeOrder ? `/student/orders/${activeOrder.id}/tracking` : '/student/history')
        }
        className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
          currentPath.includes('tracking') || currentPath === '/student/history'
            ? 'text-[#06D6F0] font-bold'
            : 'text-[#94A3B8] hover:text-[#F1F5F9]'
        }`}
      >
        <ListOrdered className="w-5 h-5" />
        <span className="text-[10px] mt-1">Orders</span>
      </button>

      {/* Prominent centered New Print Order action button */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-3.5">
        <button
          type="button"
          onClick={() => onNavigate('/student/orders/new')}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer border-2 border-[#121821] ${
            currentPath === '/student/orders/new'
              ? 'bg-[#06D6F0] text-[#0B0F14] ring-2 ring-[#06D6F0]/40'
              : 'bg-[#06D6F0] text-[#0B0F14] hover:bg-[#00b8e6]'
          }`}
          aria-label="New Print Order"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
        <span className="text-[9px] font-bold text-[#94A3B8] mt-0.5">New</span>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('/student/store')}
        className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/store' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] mt-1">Store</span>
      </button>

      <button
        type="button"
        onClick={() => onNavigate('/student/profile')}
        className={`relative flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 px-0.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/profile' ? 'text-[#06D6F0] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1/2 translate-x-2.5 w-2 h-2 bg-[#F87171] rounded-full animate-pulse" />
        )}
        <span className="text-[10px] mt-1">Profile</span>
      </button>
    </nav>
  );
};
export default MobileNav;
