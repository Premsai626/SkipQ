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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D111B]/95 backdrop-blur-2xl border-t border-[#273244] px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('/staff')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/queue')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/queue' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Queue</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/orders')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/staff/orders') ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/store')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/store' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Store</span>
        </button>

        <button
          onClick={() => onNavigate('/staff/profile')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/staff/profile' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D111B]/95 backdrop-blur-2xl border-t border-[#273244] px-2 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onNavigate('/student')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
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
            ? 'text-[#00D4FF] font-bold'
            : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
        }`}
      >
        <ListOrdered className="w-5 h-5" />
        <span className="text-[10px]">Orders</span>
      </button>

      {/* Prominent floating New Order button */}
      <div className="-mt-6">
        <button
          onClick={() => onNavigate('/student/orders/new')}
          className="w-13 h-13 rounded-full bg-[#00D4FF] text-black shadow-xl shadow-[#00D4FF]/30 flex items-center justify-center hover:bg-[#00b8e6] active:scale-95 transition-all cursor-pointer border-2 border-[#080B12]"
          aria-label="Create New Order"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <button
        onClick={() => onNavigate('/student/store')}
        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/store' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px]">Store</span>
      </button>

      <button
        onClick={() => onNavigate('/student/profile')}
        className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors cursor-pointer ${
          currentPath === '/student/profile' ? 'text-[#00D4FF] font-bold' : 'text-[#9CA3AF] hover:text-[#F9FAFB]'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#FB7185] rounded-full animate-pulse" />
        )}
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
export default MobileNav;
