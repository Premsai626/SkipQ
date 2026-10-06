import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Bell,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
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
  const { notifications, orders, metrics } = useOrders();

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
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#CCFF00] to-[#00F0FF] p-[1px] shadow-lg shadow-[#CCFF00]/10 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center text-[#CCFF00]">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">
                SKIP<span className="text-[#CCFF00]">Q</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[9px] font-black text-[#CCFF00] tracking-wider">
                CAMPUS
              </span>
            </div>
            <p className="text-[10px] text-white/50 font-medium hidden sm:block">
              Smart Print & Queue Management
            </p>
          </div>
        </div>

        {/* Center Live Queue Ticker (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] live-indicator-dot" />
          <span className="font-bold text-white">Campus Station:</span>
          <span className="text-white/70">{metrics.printingCount} print jobs active</span>
          <span className="text-white/20">•</span>
          <span className="text-[#00F0FF] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Turnaround ~{metrics.avgWaitMinutes}m
          </span>
        </div>

        {/* Right Actions & User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => onNavigate(role === 'staff' ? '/staff/orders' : '/student/notifications')}
            className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border border-[#09090b]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center font-bold text-xs">
                {role === 'staff' ? (
                  <Shield className="w-4 h-4 text-[#CCFF00]" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.name || 'Prem Sai'}
                </p>
                <p className="text-[10px] text-white/50 capitalize">
                  {role === 'staff' ? 'Campus Staff Desk' : 'Verified Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#09090b]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-white/10">
                  <p className="font-bold text-white text-sm">{user?.name || 'Prem Sai'}</p>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 uppercase">
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/history');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Order History</span>
                        <History className="w-3.5 h-3.5 text-white/40" />
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Account Profile</span>
                        <UserIcon className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium transition-colors"
                      >
                        Operational Hub
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium transition-colors"
                      >
                        Manage Orders
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/store');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium transition-colors"
                      >
                        Store Management
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white font-medium flex items-center justify-between transition-colors"
                      >
                        <span>Operator Profile</span>
                        <UserIcon className="w-3.5 h-3.5 text-white/40" />
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-1.5 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 font-bold flex items-center gap-2 transition-colors cursor-pointer"
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
