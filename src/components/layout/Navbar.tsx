import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Bell,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string, replace?: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, role, logout } = useAuth();
  const { notifications, metrics } = useOrders();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    onNavigate('/', true);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D111B]/85 backdrop-blur-xl border-b border-[#273244] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate(role === 'staff' ? '/staff' : '/student')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#8B5CF6] p-[1px] shadow-lg shadow-[#00D4FF]/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#080B12] rounded-[11px] flex items-center justify-center text-[#00D4FF]">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-[#F9FAFB] group-hover:text-[#00D4FF] transition-colors">
                SKIP<span className="text-[#00D4FF]">Q</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[9px] font-black text-[#00D4FF] tracking-wider">
                CAMPUS
              </span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] font-medium hidden sm:block">
              Smart Print & Queue Management
            </p>
          </div>
        </div>

        {/* Center Live Queue Ticker (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#111827] border border-[#273244] text-xs text-[#F9FAFB] backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#00D4FF] live-indicator-dot" />
          <span className="font-bold text-[#F9FAFB]">Campus Station:</span>
          <span className="text-[#9CA3AF]">{metrics.printingCount} print jobs active</span>
          <span className="text-[#6B7280]">•</span>
          <span className="text-[#00D4FF] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Turnaround ~{metrics.avgWaitMinutes}m
          </span>
        </div>

        {/* Right Actions & User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => onNavigate(role === 'staff' ? '/staff/orders' : '/student/notifications')}
            className="relative p-2.5 rounded-full bg-[#111827] border border-[#273244] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#202B3D] hover:border-[#00D4FF]/30 transition-all cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FB7185] text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border border-[#080B12]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#111827] border border-[#273244] hover:border-[#00D4FF]/40 hover:bg-[#202B3D] transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 flex items-center justify-center font-bold text-xs">
                {role === 'staff' ? (
                  <Shield className="w-4 h-4 text-[#00D4FF]" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#F9FAFB] leading-tight">
                  {user?.name || 'Prem Sai'}
                </p>
                <p className="text-[10px] text-[#9CA3AF] capitalize">
                  {role === 'staff' ? 'Campus Staff Desk' : 'Verified Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#111827] backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#273244] p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-[#273244]">
                  <p className="font-bold text-[#F9FAFB] text-sm">{user?.name || 'Prem Sai'}</p>
                  <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 uppercase">
                    {role === 'staff' ? 'Xerox Operator' : user?.collegeId || 'Student'}
                  </span>
                </div>

                <div className="py-1.5 space-y-0.5">
                  {role === 'student' ? (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/history');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Order History</span>
                        <History className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Account Profile</span>
                        <UserIcon className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium transition-colors"
                      >
                        Operational Hub
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium transition-colors"
                      >
                        Manage Orders
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/store');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium transition-colors"
                      >
                        Store Management
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Operator Profile</span>
                        <UserIcon className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-1.5 border-t border-[#273244]">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FB7185]/15 text-[#FB7185] font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
