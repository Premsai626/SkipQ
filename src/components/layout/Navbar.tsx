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
  onNavigate: (path: string) => void;
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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                SKIP<span className="text-brand-600 font-black">Q</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Campus Print & Stationery Desk
            </p>
          </div>
        </div>

        {/* Center Live Queue Ticker (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator-dot" />
          <span className="font-semibold text-slate-800">Campus Station Status:</span>
          <span>{metrics.printingCount} print jobs active</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Turnaround: ~{metrics.avgWaitMinutes}m
          </span>
        </div>

        {/* Right Actions & User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => onNavigate(role === 'staff' ? '/staff/orders' : '/student/notifications')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                {role === 'staff' ? (
                  <Shield className="w-4 h-4 text-slate-800" />
                ) : (
                  user?.name?.slice(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'Prem Sai'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {role === 'staff' ? 'Campus Staff Desk' : 'Verified Student'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-floating border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{user?.name || 'Prem Sai'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 uppercase">
                    {role === 'staff' ? 'Xerox Operator' : user?.collegeId || 'Student'}
                  </span>
                </div>

                <div className="py-1">
                  {role === 'student' ? (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                      >
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/history');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                      >
                        <span>Order History</span>
                        <History className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/student/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                      >
                        <span>Account Profile</span>
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        Operational Hub
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        Manage Orders
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onNavigate('/staff/analytics');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        Campus Analytics
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
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
