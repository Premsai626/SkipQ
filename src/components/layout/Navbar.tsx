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
    <header className="sticky top-0 z-40 w-full bg-[#121821]/95 backdrop-blur-xl border-b border-[#273244] shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate(role === 'staff' ? '/staff' : '/student')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#06D6F0] to-[#8B5CF6] p-[1px] shadow-sm shrink-0">
            <div className="w-full h-full bg-[#0B0F14] rounded-[11px] flex items-center justify-center text-[#06D6F0]">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-[#F1F5F9] group-hover:text-[#06D6F0] transition-colors">
                SKIP<span className="text-[#06D6F0]">Q</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#06D6F0]/10 border border-[#06D6F0]/30 text-[8px] sm:text-[9px] font-black text-[#06D6F0] tracking-wider hidden xs:inline-block">
                CAMPUS
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-medium hidden sm:block truncate">
              Smart Print & Queue Management
            </p>
          </div>
        </div>

        {/* Center Live Queue Ticker (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#18212C] border border-[#273244] text-xs text-[#F1F5F9] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#06D6F0] live-indicator-dot" />
          <span className="font-bold text-[#F1F5F9]">Campus Station:</span>
          <span className="text-[#94A3B8]">{metrics.printingCount} print jobs active</span>
          <span className="text-[#273244]">•</span>
          <span className="text-[#06D6F0] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Turnaround ~{metrics.avgWaitMinutes}m
          </span>
        </div>

        {/* Right Actions & User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Button */}
          <button
            onClick={() => onNavigate(role === 'staff' ? '/staff/orders' : '/student/notifications')}
            className="relative p-2 sm:p-2.5 rounded-full bg-[#18212C] border border-[#273244] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#202B3D] hover:border-[#06D6F0]/30 transition-all cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F87171] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#121821]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-3 rounded-full bg-[#18212C] border border-[#273244] hover:border-[#06D6F0]/40 hover:bg-[#202B3D] transition-all cursor-pointer select-none"
              aria-label="User menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#06D6F0]/15 text-[#06D6F0] border border-[#06D6F0]/30 flex items-center justify-center font-bold text-xs shrink-0">
                {role === 'staff' ? (
                  <Shield className="w-4 h-4 text-[#06D6F0]" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || <UserIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <p className="text-xs font-bold text-[#F1F5F9] leading-tight truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-[#94A3B8] capitalize truncate">
                  {role === 'staff' ? 'Campus Staff Desk' : 'Verified Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pr-1 sm:pr-0" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-[#121821] backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#273244] p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-[#273244]">
                  <p className="font-bold text-[#F1F5F9] text-sm truncate">{user?.name || 'Student'}</p>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06D6F0]/15 text-[#06D6F0] border border-[#06D6F0]/30 uppercase font-mono">
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/history');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Order History</span>
                        <History className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium flex items-center justify-between transition-colors"
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium transition-colors"
                      >
                        Operational Hub
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium transition-colors"
                      >
                        Manage Orders
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/store');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium transition-colors"
                      >
                        Store Management
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#18212C] text-[#94A3B8] hover:text-[#06D6F0] font-medium flex items-center justify-between transition-colors"
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
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F87171]/15 text-[#F87171] font-bold flex items-center gap-2 transition-colors cursor-pointer"
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
